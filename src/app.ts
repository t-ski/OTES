/**
 * Interface module performing the test run by test file evaluation.
 */


import { isAbsolute, join } from "path";
import { existsSync, readdir } from "fs";


import * as print from "./print";

import { Test } from "./Test";
import { UnitTest } from "./UnitTest";
import { NetworkTest } from "./NetworkTest";


const args = process.argv.slice(2);

if(args.length === 0) {
	throw new ReferenceError("Missing test directory argument (index 0)");
}

const testDirPath: string = !isAbsolute(args[0]) ? join(process.cwd(), args[0]) : args[0];

if(!existsSync(testDirPath)) {
	throw new ReferenceError(`Given test file directory '${testDirPath}' does not exist`);
}


// Provide globals for test scripts in order not to require any includes
global.NetworkTest = NetworkTest;
global.UnitTest = UnitTest;


/*
 * Accordingly wrap and clean up test results and environment.
 */
process.on("exit", () => {
	if(process.exitCode === 1) {
		// Manual exit
		return;
	}

	const testResults: number[] = Test.evalResults();
	const testResultsDepiction = `(${testResults[0]}/${testResults[0] + testResults[1]} successful)`;

	// Error has occurred throughout test suite execution
	if(!Test.suiteSuccessful()) {
		print.close(`Test suite run failed ${testResultsDepiction}.`, false);

		process.exit(1);
	}

	// No test has failed => SUCCESS
	print.close(`Test suite run succeeded ${testResultsDepiction}.`);
});


function traverseTestDir(path: string) {
	readdir(path, {
		withFileTypes: true
	}, (_, dirents) => {
		(dirents || []).forEach(dirent => {
			const testFilePath: string = join(path, dirent.name);
    
			if(dirent.isDirectory()) {
				traverseTestDir(testFilePath);

				return;
			}

			if(!/\.test\.js$/i.test(dirent.name)) {
				return;
			}
            
			print.fileName(dirent.name);
    
			try {
				require(testFilePath);
			} catch(err) {
				print.error("An error occured upon test file evaluation", err);
			}
		});
	});
}
// TODO: Scan for setup files in order require them once needed


// RUN TEST SUITE
// Evaluate each *.test.js file in the test directory in order of scan
traverseTestDir(testDirPath);

print.badge("TEST SUITE", 245, 235, 155);