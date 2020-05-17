"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var puppeteer_1 = require("puppeteer");
exports.logger = {
    info: console.log
};
exports.screenshot = null;
exports.store = null;
var taskableEnv = /** @class */ (function () {
    function taskableEnv(taskId, page, resolve) {
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
        // start log capture
        this.captureLogs();
    }
    /**
     * create a new step, add it to the steps object, and set the step variables
     * returns a dictionary
     */
    taskableEnv.prototype.newStep = function () {
        this.currentStep++;
        var step = this.createStep();
        this.steps.push(step);
        this.step = step;
        return step;
    };
    /**
     * create a new step - set the step and push the prior step into the steps array
     */
    taskableEnv.prototype.createStep = function () {
        var stepNumber = this.currentStep;
        var resultStore = [];
        var screenshots = [];
        var logs = [];
        return { stepNumber: stepNumber, resultStore: resultStore, screenshots: screenshots, logs: logs };
    };
    taskableEnv.prototype.fail = function (err) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.screenshot("error-step-" + this.currentStep)];
                    case 1:
                        _a.sent();
                        this.store(err);
                        console.log(err);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the step of the task
     */
    taskableEnv.prototype.stepComplete = function (progress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return resolve(); })];
            });
        });
    };
    taskableEnv.prototype.taskComplete = function () {
        console.log("complete");
        this.resolve(this.steps);
    };
    /**
     * Capture log data, and append them to the passed logs list
     */
    taskableEnv.prototype.captureLogs = function () {
        var _this = this;
        // attach console listeners to the page, to make sure we capture the results
        this.page.on('console', function (message) {
            return _this.step.logs.push({
                type: 'console',
                message: message.type().substr(0, 3).toUpperCase() + " " + message.text()
            });
        })
            .on('pageerror', function (_a) {
            var message = _a.message;
            return _this.step.logs.push({
                type: 'pageerror',
                message: message
            });
        })
            .on('response', function (response) {
            return _this.step.logs.push({
                type: 'response',
                message: response.status() + " " + response.url()
            });
        })
            .on('requestfailed', function (request) {
            var failure = request.failure();
            var error = failure.errorText || '';
            _this.step.logs.push({
                type: 'requestfailed',
                message: error + " " + request.url()
            });
        });
    };
    taskableEnv.prototype.screenshot = function (name, args) {
        if (args === void 0) { args = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var ss;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.page.screenshot(args)];
                    case 1:
                        ss = _a.sent();
                        this.step.screenshots.push({
                            name: name || "screenshot" + this.step.screenshots.length,
                            image: ss
                        });
                        return [2 /*return*/, ss];
                }
            });
        });
    };
    taskableEnv.prototype.store = function (data) {
        this.step.resultStore.push(data);
    };
    return taskableEnv;
}());
exports.taskableEnv = taskableEnv;
var taskableContext = /** @class */ (function () {
    function taskableContext(page, taskComplete, screenshot, store, newStep, stepComplete, fail) {
        this.page = page;
        this.taskComplete = taskComplete;
        this.screenshot = screenshot;
        this.store = store;
        this.newStep = newStep;
        this.stepComplete = stepComplete;
        this.fail = fail;
    }
    taskableContext.prototype.run = function (steps) {
        return __awaiter(this, void 0, void 0, function () {
            var taskResults, stepCount, _a, _b, _i, index, step_1, envStep, start, results, err_1, end, progress;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        taskResults = [];
                        stepCount = steps.length;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, , 10, 11]);
                        _a = [];
                        for (_b in steps)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        index = _a[_i];
                        step_1 = steps[index];
                        envStep = this.newStep();
                        start = new Date().getTime();
                        results = {};
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, step_1.run(this.page, {
                                screenshot: this.screenshot,
                                store: this.store
                            })];
                    case 4:
                        results = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _c.sent();
                        console.error("step failed " + err_1);
                        this.fail(err_1);
                        return [3 /*break*/, 6];
                    case 6:
                        end = new Date().getTime();
                        // store step execution time
                        envStep.executionTime = (end - start) / 1000;
                        progress = (envStep.stepNumber / stepCount) * 100;
                        return [4 /*yield*/, this.stepComplete(progress)];
                    case 7:
                        _c.sent();
                        exports.logger.info("completed step " + envStep.stepNumber + ", completed in " + envStep.executionTime + " seconds");
                        taskResults.push(results);
                        _c.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        this.taskComplete(taskResults);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    return taskableContext;
}());
var step = /** @class */ (function () {
    function step(func) {
        this.func = func;
    }
    step.prototype.run = function (page, context) {
        return __awaiter(this, void 0, void 0, function () {
            var stepFunc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stepFunc = this.func.bind(context);
                        return [4 /*yield*/, stepFunc(__assign({ page: page }, context))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return step;
}());
exports.step = step;
exports.task = {
    run: function (tasks) { return __awaiter(void 0, void 0, void 0, function () {
        var browser, page, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("running");
                    return [4 /*yield*/, puppeteer_1.launch()];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                            var taskableEnvironment;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        taskableEnvironment = new taskableEnv('test', page, resolve);
                                        return [4 /*yield*/, taskableEnvironment.taskableContext.run(tasks)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    results = _a.sent();
                    console.log("done", results);
                    browser.close();
                    return [2 /*return*/];
            }
        });
    }); }
};
