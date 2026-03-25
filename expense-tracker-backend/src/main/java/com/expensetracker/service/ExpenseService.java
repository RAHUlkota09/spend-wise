package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDTO;
import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense addExpense(ExpenseDTO.Request dto, User user) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(dto.getCategory());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getExpenseDate());
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpensesByUser(User user) {
        return expenseRepository.findByUserOrderByExpenseDateDesc(user);
    }

    public List<Expense> getRecentExpenses(User user) {
        return expenseRepository.findTop5ByUserOrderByCreatedTimeDesc(user);
    }

    public Expense getExpenseById(Long expenseId, User user) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }
        return expense;
    }

    public Expense updateExpense(Long expenseId, ExpenseDTO.Request dto, User user) {
        Expense expense = getExpenseById(expenseId, user);
        expense.setCategory(dto.getCategory());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getExpenseDate());
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long expenseId, User user) {
        Expense expense = getExpenseById(expenseId, user);
        expenseRepository.delete(expense);
    }

    public BigDecimal getTotalExpenses(User user) {
        BigDecimal total = expenseRepository.getTotalExpenseByUser(user);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getMonthlyExpenses(User user) {
        BigDecimal monthly = expenseRepository.getMonthlyExpenseByUser(user);
        return monthly != null ? monthly : BigDecimal.ZERO;
    }

    public Map<String, BigDecimal> getCategoryWiseExpenses(User user) {
        List<Object[]> results = expenseRepository.getCategoryWiseExpense(user);
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Object[] row : results) {
            map.put((String) row[0], (BigDecimal) row[1]);
        }
        return map;
    }

    public ExpenseDTO.Response toResponse(Expense expense) {
        ExpenseDTO.Response res = new ExpenseDTO.Response();
        res.setExpenseId(expense.getExpenseId());
        res.setCategory(expense.getCategory());
        res.setAmount(expense.getAmount());
        res.setDescription(expense.getDescription());
        res.setExpenseDate(expense.getExpenseDate());
        res.setCreatedTime(expense.getCreatedTime());
        return res;
    }

    public List<ExpenseDTO.Response> toResponseList(List<Expense> expenses) {
        return expenses.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
