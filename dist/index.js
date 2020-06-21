"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.task = exports.vars = exports.step = exports.taskableEnv = exports.store = exports.screenshot = exports.logger = void 0;
const puppeteer_1 = require("puppeteer");
let appRoot = require('app-root-path');
exports.logger = {
    info: console.log,
};
exports.screenshot = null;
exports.store = null;
class taskableEnv {
    constructor(taskId, page, resolve) {
        this.taskId = taskId;
        this.page = page;
        this.resolve = resolve;
        this.steps = [];
        this.step = { logs: [] };
        this.currentStep = 0;
        this.newStep = this.newStep.bind(this);
        this.stepComplete = this.stepComplete.bind(this);
        this.createStep = this.createStep.bind(this);
        this.screenshot = this.screenshot.bind(this);
        this.store = this.store.bind(this);
        this.captureLogs = this.captureLogs.bind(this);
        this.taskComplete = this.taskComplete.bind(this);
        this.fail = this.fail.bind(this);
        this.taskableContext = new taskableContext(page, this.taskComplete, this.screenshot, this.store, this.newStep, this.stepComplete, this.fail);
        this.captureLogs();
    }
    newStep() {
        this.currentStep++;
        let step = this.createStep();
        this.steps.push(step);
        this.step = step;
        return step;
    }
    createStep() {
        let stepNumber = this.currentStep;
        let resultStore = [];
        let screenshots = [];
        let logs = [];
        return { stepNumber, resultStore, screenshots, logs };
    }
    fail(err) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.screenshot(`error-step-${this.currentStep}`);
            this.store(err);
            console.log(err);
        });
    }
    stepComplete(progress) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('progress', progress);
            return new Promise((resolve) => resolve());
        });
    }
    taskComplete() {
        console.log('complete');
        this.resolve(this.steps);
    }
    captureLogs() {
        const createLog = (type, message) => {
            let timestamp = new Date().getTime();
            this.step.logs.push({ timestamp, type, message });
        };
        this.page
            .on('console', message => createLog('console', `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
            .on('pageerror', ({ message }) => createLog('pageerror', message))
            .on('response', response => createLog('response', `${response.status()} ${response.url()}`))
            .on('requestfailed', request => createLog('requestfailed', `${request.failure().errorText} ${request.url()}`));
    }
    screenshot(name, args = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let ss = yield this.page.screenshot(args);
            this.step.screenshots.push({
                name: name || `screenshot${this.step.screenshots.length}`,
                image: ss,
            });
            return ss;
        });
    }
    store(data) {
        this.step.resultStore.push(data);
    }
}
exports.taskableEnv = taskableEnv;
class taskableContext {
    constructor(page, taskComplete, screenshot, store, newStep, stepComplete, fail) {
        this.page = page;
        this.taskComplete = taskComplete;
        this.screenshot = screenshot;
        this.store = store;
        this.newStep = newStep;
        this.stepComplete = stepComplete;
        this.fail = fail;
    }
    run(steps) {
        return __awaiter(this, void 0, void 0, function* () {
            let taskResults = [];
            let stepCount = steps.length;
            try {
                for (let index in steps) {
                    let step = steps[index];
                    let envStep = this.newStep();
                    let start = new Date().getTime();
                    let results = {};
                    try {
                        results = yield step.run(this.page, {
                            screenshot: this.screenshot,
                            store: this.store,
                        });
                    }
                    catch (err) {
                        console.error(`step failed ${err}`);
                        this.fail(err);
                    }
                    let end = new Date().getTime();
                    envStep.executionTime = (end - start) / 1000;
                    let progress = (envStep.stepNumber / stepCount) * 100;
                    yield this.stepComplete(progress);
                    exports.logger.info(`completed step ${envStep.stepNumber}, completed in ${envStep.executionTime} seconds`);
                    taskResults.push(results);
                }
            }
            finally {
                this.taskComplete(taskResults);
            }
        });
    }
}
class step {
    constructor(func) {
        this.func = func;
    }
    run(page, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let stepFunc = this.func.bind(context);
            return yield stepFunc(Object.assign({ page }, context));
        });
    }
}
exports.step = step;
let importedVars = {};
try {
    importedVars = require(`${appRoot.path}/vars.json`) || {};
}
catch (e) {
    console.log('failed to load variables from vars.json');
}
exports.vars = importedVars;
exports.task = {
    run: (tasks) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('running');
        let browser = yield puppeteer_1.launch();
        let page = yield browser.newPage();
        let results = yield new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
            let taskableEnvironment = new taskableEnv('test', page, resolve);
            yield taskableEnvironment.taskableContext.run(tasks);
        }));
        console.log('done', results);
        browser.close();
    }),
};
//# sourceMappingURL=index.js.map