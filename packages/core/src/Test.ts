import { EventEmitter } from "events";
import { deepEqual } from "assert";

import { TColor } from "../../common.types";
import { Promisification } from "./Promisification";

import _config from "./config.json";


export abstract class Test<A = unknown, E = unknown> {
	private static runningTests = 0;
	private static completeTimeout: NodeJS.Timeout;

	public static readonly suiteTitle: string;
	public static readonly suiteColor: TColor;
	
	public static readonly event = new EventEmitter();

	private wasConsumed = false;
	
	public readonly title: string;
	public readonly sourcePosition?: string;

	public wasSuccessful: boolean;
	public displayActual: unknown;
	public displayExpected: unknown;

    constructor(title: string) {
    	this.title = title;
		
    	try {
    		throw new Error();
    	} catch(err) {
    		try {
    			this.sourcePosition = err.stack
				.split(/\n/g)[2]
				.match(/(\/[^/ ]*)+/g)[0]
				.slice(0, -1);
    		} catch {}
    	}

		clearTimeout(Test.completeTimeout);
		Test.runningTests++;
		
		Test.event.emit("create", this);
    }
	
    protected evalActualExpression(...expressions: unknown[]): A|Promise<A> {
		return expressions[0] as unknown as A;
	}

    protected isEqual(actual: A, expected: E): boolean {
		try {
			deepEqual(actual, expected);
		} catch {
			return false;
		}
		return true;
	}

	protected getDisplayValues(actual: A, expected: E): {
		actual: unknown;
		expected: unknown;
	} {
		return { actual, expected };
	}

    public actual(...expressions: unknown[]) {
		if(this.wasConsumed) throw new SyntaxError("Test case was already consumed");
		this.wasConsumed = true;

		const evalActual = async (): Promise<A> => {
			return await new Promisification<A>(this.evalActualExpression(
				...expressions
				.map(async (expression: unknown) => await new Promisification(expression).resolve())
			)).resolve();
		};
		const complete = () => {
			if(--Test.runningTests > 0) return;

			Test.completeTimeout = setTimeout(() => Test.event.emit("complete"), _config.completeTimeout);
		};

    	return {

    		expected: async (expression: unknown) => {
				const actual: A =  await  evalActual();
				const expected: E = await new Promisification<E>(expression).resolve();
				
				this.wasSuccessful = this.isEqual(actual, expected);
				
				const displayValues = this.getDisplayValues(actual, expected);
				this.displayActual = displayValues.actual;
				this.displayExpected = displayValues.expected;

				complete();
    		},

			error: async (message: string, ErrorPrototype?: ErrorConstructor) => {
				this.displayExpected = `${ErrorPrototype?.name ? `${ErrorPrototype.name}: ` : ""}${message}`;

				evalActual()
				.then(() => {
					this.wasSuccessful = false;
					
					this.displayActual = "No error";
				})
				.catch((err: Object) => {
					this.wasSuccessful
					=  (ErrorPrototype ? (err.constructor === ErrorPrototype) : true)
					&& (message === (((err instanceof Error)) ? err.message : err));
					
					this.displayActual = err.toString();
				})
				.finally(complete);
			}

    	};
    }
}