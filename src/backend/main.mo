import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Month = Nat;
  type UserId = Principal;

  type SaleId = Nat;
  type ExpenseId = Nat;

  type Language = {
    #en;
    #de;
    #fr;
  };

  type UserProfile = {
    firstName : Text;
    activityType : Text;
    language : Language;
  };

  type ExpenseCategory = {
    #marketing;
    #product;
    #travel;
    #subscriptions;
    #other;
  };

  type Sale = {
    id : Nat;
    user : UserId;
    date : Time.Time;
    amount : Float;
    product : ?Text;
  };

  type Expense = {
    id : Nat;
    user : UserId;
    date : Time.Time;
    amount : Float;
    category : ExpenseCategory;
  };

  type Goal = {
    monthlyGoalAmount : Float;
    month : Month;
    user : UserId;
  };

  module Goal {
    public func compare(goal1 : Goal, goal2 : Goal) : Order.Order {
      Nat.compare(goal1.month, goal2.month);
    };
  };

  module Sale {
    public func compare(s1 : Sale, s2 : Sale) : Order.Order {
      Int.compare(s1.date, s2.date);
    };
  };

  module Expense {
    public func compare(e1 : Expense, e2 : Expense) : Order.Order {
      Int.compare(e1.date, e2.date);
    };
  };

  let userProfiles = Map.empty<UserId, UserProfile>();
  let sales = Map.empty<UserId, [Sale]>();
  let expenses = Map.empty<UserId, [Expense]>();
  let goals = Map.empty<UserId, [Goal]>();

  var nextSaleId = 0;
  var nextExpenseId = 0;

  public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already exists");
    };

    userProfiles.add(caller, profile);
    sales.add(caller, []);
    expenses.add(caller, []);
    goals.add(caller, []);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(userId : UserId) : async ?UserProfile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(userId);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getSales() : async [Sale] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access sales");
    };
    switch (sales.get(caller)) {
      case (null) { [] };
      case (?userSales) { userSales.sort() };
    };
  };

  public shared ({ caller }) func createSale(amount : Float, product : ?Text) : async Sale {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create sales");
    };

    let sale : Sale = { id = nextSaleId; user = caller; date = Time.now(); amount; product };
    nextSaleId += 1;

    let userSales = switch (sales.get(caller)) {
      case (null) { [sale] };
      case (?currentSales) { currentSales.concat([sale]) };
    };
    sales.add(caller, userSales);
    sale;
  };

  public query ({ caller }) func getExpenses() : async [Expense] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access expenses");
    };
    switch (expenses.get(caller)) {
      case (null) { [] };
      case (?userExpenses) { userExpenses.sort() };
    };
  };

  public shared ({ caller }) func createExpense(amount : Float, category : ExpenseCategory) : async Expense {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create expenses");
    };

    let expense : Expense = { id = nextExpenseId; user = caller; date = Time.now(); amount; category };
    nextExpenseId += 1;

    let userExpenses = switch (expenses.get(caller)) {
      case (null) { [expense] };
      case (?currentExpenses) { currentExpenses.concat([expense]) };
    };
    expenses.add(caller, userExpenses);
    expense;
  };

  public shared ({ caller }) func setMonthlyGoal(month : Month, goalAmount : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can set goals");
    };

    let goal : Goal = { monthlyGoalAmount = goalAmount; month; user = caller };
    let userGoals = switch (goals.get(caller)) {
      case (null) { [goal] };
      case (?currentGoals) { currentGoals.concat([goal]) };
    };
    goals.add(caller, userGoals);
  };

  public query ({ caller }) func getCurrentGoal(month : Month) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access goals");
    };
    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("No goal defined") };
      case (?g) { g };
    };
    let iter = userGoals.values();
    let goal = iter.find(func(g) { g.month == month });
    switch (goal) { case (null) { Runtime.trap("No goal defined") }; case (?g) { g.monthlyGoalAmount } };
  };

  public query ({ caller }) func getMonthlyGoalProgress(year : Nat, month : Month) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access goal progress");
    };
    let salesAmount = switch (sales.get(caller)) {
      case (null) { 0.0 };
      case (?s) {
        let rangeSales = s.filter(
          func(sale) {
            let t = Time.now();
            (sale.date > t - 30 * (24 * 60 * 60 * 1_000_000_000));
          }
        );
        rangeSales.foldLeft(0.0, func(acc, sale) { acc + sale.amount });
      };
    };

    let expensesAmount = switch (expenses.get(caller)) {
      case (null) { 0.0 };
      case (?e) {
        let rangeExpenses = e.filter(
          func(expense) {
            let t = Time.now();
            (expense.date > t - 30 * (24 * 60 * 60 * 1_000_000_000));
          }
        );
        rangeExpenses.foldLeft(0.0, func(acc, expense) { acc + expense.amount });
      };
    };

    let profit = salesAmount - expensesAmount;
    let goal = switch (goals.get(caller)) {
      case (null) { return 0.0 };
      case (?userGoals) {
        let iter = userGoals.values();
        let g = iter.find(func(g) { g.month == month });
        switch (g) { case (null) { return 0.0 }; case (?g) { g.monthlyGoalAmount } };
      };
    };
    if (goal == 0.0) { return 0.0 };
    let percentage = (100.0 * profit) / goal;
    percentage;
  };

  public query ({ caller }) func getAvailableCash() : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access cash balance");
    };
    let salesAmount = switch (sales.get(caller)) {
      case (null) { 0.0 };
      case (?s) {
        s.foldLeft(0.0, func(acc, sale) { acc + sale.amount });
      };
    };

    let expensesAmount = switch (expenses.get(caller)) {
      case (null) { 0.0 };
      case (?e) {
        e.foldLeft(0.0, func(acc, expense) { acc + expense.amount });
      };
    };

    salesAmount - expensesAmount;
  };
};
