package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseDTO;
import com.expensetracker.model.User;
import com.expensetracker.service.ExpenseService;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    private User getCurrentUser(Authentication auth) {
        return userService.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO.Response>> getAllExpenses(
            Authentication auth,
            @RequestParam(value = "category", required = false) String category) {

        User user = getCurrentUser(auth);
        var expenses = expenseService.getAllExpensesByUser(user);

        if (category != null && !category.isBlank()) {
            expenses = expenses.stream()
                    .filter(e -> e.getCategory().equalsIgnoreCase(category))
                    .toList();
        }
        return ResponseEntity.ok(expenseService.toResponseList(expenses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO.Response> getExpense(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(expenseService.toResponse(expenseService.getExpenseById(id, user)));
    }

    @PostMapping
    public ResponseEntity<ExpenseDTO.Response> addExpense(
            @Valid @RequestBody ExpenseDTO.Request dto,
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(expenseService.toResponse(expenseService.addExpense(dto, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO.Response> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseDTO.Request dto,
            Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(expenseService.toResponse(expenseService.updateExpense(id, dto, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        expenseService.deleteExpense(id, user);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseDTO.SummaryResponse> getSummary(Authentication auth) {
        User user = getCurrentUser(auth);
        ExpenseDTO.SummaryResponse summary = new ExpenseDTO.SummaryResponse();
        summary.setTotalExpenses(expenseService.getTotalExpenses(user));
        summary.setMonthlyExpenses(expenseService.getMonthlyExpenses(user));
        summary.setCategoryBreakdown(expenseService.getCategoryWiseExpenses(user));
        summary.setRecentExpenses(expenseService.toResponseList(expenseService.getRecentExpenses(user)));
        return ResponseEntity.ok(summary);
    }
}
