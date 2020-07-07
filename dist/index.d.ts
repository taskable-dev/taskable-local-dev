import { LaunchOptions, Page } from 'puppeteer';
export declare const logger: {
    info: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
};
export declare const screenshot: any;
export declare const store: any;
export declare class taskableEnv {
    taskId: string;
    page: Page;
    resolve: any;
    steps: Array<any>;
    step: any;
    currentStep: number;
    taskableContext: taskableContext;
    constructor(taskId: string, page: Page, resolve: any);
    newStep(): any;
    createStep(): {
        stepNumber: number;
        resultStore: any[];
        screenshots: any[];
        logs: any[];
    };
    fail(err: string): Promise<void>;
    stepComplete(progress: number): Promise<unknown>;
    taskComplete(): void;
    captureLogs(): void;
    screenshot(name: string, args?: any): Promise<string>;
    store(data: any): void;
}
declare class taskableContext {
    page: any;
    taskComplete: any;
    screenshot: any;
    store: any;
    newStep: any;
    stepComplete: any;
    fail: any;
    constructor(page: Page, taskComplete: any, screenshot: any, store: any, newStep: any, stepComplete: any, fail: any);
    run(steps: Array<step>): Promise<void>;
}
export declare class step {
    func: any;
    store: any;
    screenshot: any;
    constructor(func: any);
    run(page: Page, context: any): Promise<any>;
}
export interface TaskableStepParameters {
    page: Page;
    store(data: any): any;
    screenshot(name?: string, options?: any): any;
}
export declare const vars: any;
export declare const task: {
    run: (tasks: Array<step>, options?: LaunchOptions | undefined) => Promise<void>;
};
export {};
