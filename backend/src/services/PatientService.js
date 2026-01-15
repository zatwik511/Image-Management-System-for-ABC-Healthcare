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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientService = exports.PatientService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = 'https://jfywooouzwtlgztjnzlw.supabase.co';
var supabaseKey = 'sb_publishable_Cp9gNbNgzfc2JRbznRW1Sw_rFrkO2Im';
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
var PatientService = /** @class */ (function () {
    function PatientService() {
        this.tableName = 'patients';
    }
    // METHOD 1: Create a new patient
    PatientService.prototype.createPatient = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var name, address, conditions, newPatient, _a, insertedData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        name = data.name, address = data.address, conditions = data.conditions;
                        newPatient = {
                            name: name,
                            address: address,
                            conditions: conditions || [],
                            diagnosis: '',
                            totalCost: 0,
                            medicalHistory: [],
                            createdAt: new Date().toISOString(),
                        };
                        return [4 /*yield*/, supabase
                                .from(this.tableName)
                                .insert([newPatient])
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), insertedData = _a.data, error = _a.error;
                        if (error) {
                            console.error('Supabase error:', error);
                            throw new Error("Failed to create patient: ".concat(error.message));
                        }
                        return [2 /*return*/, insertedData];
                }
            });
        });
    };
    // METHOD 2: Get a patient by their ID
    PatientService.prototype.getPatient = function (patientID) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from(this.tableName)
                            .select()
                            .eq('id', patientID)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw new Error("Failed to fetch patient: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // METHOD 3: Get ALL patients
    PatientService.prototype.listPatients = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from(this.tableName)
                            .select()
                            .order('createdAt', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to fetch patients: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // METHOD 4: Delete a patient
    PatientService.prototype.deletePatient = function (patientID) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from(this.tableName)
                            .delete()
                            .eq('id', patientID)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw new Error("Failed to delete patient: ".concat(error.message));
                        return [2 /*return*/];
                }
            });
        });
    };
    // METHOD 5: Update diagnosis
    PatientService.prototype.updateDiagnosis = function (patientID, diagnosis) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from(this.tableName)
                            .update({ diagnosis: diagnosis })
                            .eq('id', patientID)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to update diagnosis: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // METHOD 6: Get total cost for a patient
    PatientService.prototype.getTotalCost = function (patientID) {
        return __awaiter(this, void 0, void 0, function () {
            var patient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPatient(patientID)];
                    case 1:
                        patient = _a.sent();
                        return [2 /*return*/, (patient === null || patient === void 0 ? void 0 : patient.totalCost) || 0];
                }
            });
        });
    };
    // METHOD 7: Update total cost (called by FinancialService)
    PatientService.prototype.updateTotalCost = function (patientID, newTotal) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from(this.tableName)
                            .update({ totalCost: newTotal })
                            .eq('id', patientID)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw new Error("Failed to update total cost: ".concat(error.message));
                        return [2 /*return*/];
                }
            });
        });
    };
    // METHOD 8: Count total patients
    PatientService.prototype.getTotalPatientCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, count, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from(this.tableName)
                            .select('*', { count: 'exact', head: true })];
                    case 1:
                        _a = _b.sent(), count = _a.count, error = _a.error;
                        if (error)
                            throw new Error("Failed to count patients: ".concat(error.message));
                        return [2 /*return*/, count || 0];
                }
            });
        });
    };
    return PatientService;
}());
exports.PatientService = PatientService;
exports.patientService = new PatientService();
