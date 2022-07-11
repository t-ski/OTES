import { Test } from "./Test";


export class UnitTest extends Test {

    private static badgeColor: number[] = [255, 155, 195];
    
    constructor(func: ((...args) => any), caption: string) {
        if(!(func instanceof Function) && typeof(func) !== "function") {
            throw new TypeError("Unit test requires function argument");
        }

        super(func, caption);

        super.badgeColor = UnitTest.badgeColor;
    }

    public invokeInterfaceProperty(...args: any[]) {
        return this.interfaceProperty(...args);
    }

    protected handleInvocationError(err: Error) {
        this.pushWarning("Could not apply function to given arguments");
    }

}