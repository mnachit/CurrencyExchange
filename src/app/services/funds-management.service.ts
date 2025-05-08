import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";
import { Funds } from "../models/funds.mode";
import { Observable } from "rxjs";
import { EmployeeFunds } from "./employee-funds.service";

@Injectable({
    providedIn: 'root'
})
export class FundsManagementService {
    private apiUrl = environment.apiUrl + '/fundBalance';

    constructor(private http: HttpClient) { }

    addFundsManagement(funds: Funds): Observable<{ message: string, result: string, errors: string, errorMap: string[] }> {
        return this.http.post<{ message: string, result: string, errors: string, errorMap: string[] }>(this.apiUrl + '/save', funds);
    }

    getFundsManagement(): Observable<{ message: string, result: string, errors: string, errorMap: string[] }> {
        return this.http.get<{ message: string, result: string, errors: string, errorMap: string[] }>(this.apiUrl + '/getList');
    }

    getAvailableBalanceWithCurrency(funds: Funds): Observable<{ message: string, result: string, errors: string, errorMap: string[] }> {
        return this.http.post<{ message: string, result: string, errors: string, errorMap: string[] }>(this.apiUrl + '/getAvailableBalanceWithCurrency', funds);
    }

    saveEmployeeFunds(employeeFunds: any): Observable<{ message: string, result: string, errors: string, errorMap: string[] }> {
        console.log('Saving employee funds:', employeeFunds);

        return this.http.post<{ message: string, result: string, errors: string, errorMap: string[] }>(
            `${this.apiUrl}/funds/employees/save`, employeeFunds);
    }

    generateHistory(employee: EmployeeFunds): Observable<{ message: string, result: any[], errors: string, errorMap: string[] }> {
        return this.http.get<{ message: string, result: any[], errors: string, errorMap: string[] }>(`${this.apiUrl}/funds/employees/history/${employee.id}`)
    }

    }