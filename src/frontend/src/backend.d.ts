import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = Principal;
export type Time = bigint;
export interface Sale {
    id: bigint;
    date: Time;
    user: UserId;
    amount: number;
    product?: string;
}
export type Month = bigint;
export interface UserProfile {
    activityType: string;
    language: Language;
    firstName: string;
}
export interface Expense {
    id: bigint;
    date: Time;
    user: UserId;
    category: ExpenseCategory;
    amount: number;
}
export enum ExpenseCategory {
    subscriptions = "subscriptions",
    other = "other",
    marketing = "marketing",
    travel = "travel",
    product = "product"
}
export enum Language {
    de = "de",
    en = "en",
    fr = "fr"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createExpense(amount: number, category: ExpenseCategory): Promise<Expense>;
    createSale(amount: number, product: string | null): Promise<Sale>;
    getAvailableCash(): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentGoal(month: Month): Promise<number>;
    getExpenses(): Promise<Array<Expense>>;
    getMonthlyGoalProgress(year: bigint, month: Month): Promise<number>;
    getSales(): Promise<Array<Sale>>;
    getUserProfile(userId: UserId): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(profile: UserProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setMonthlyGoal(month: Month, goalAmount: number): Promise<void>;
}
