package com.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseDTO {

    public static class Request {
        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        private String description;

        @NotNull(message = "Expense date is required")
        private LocalDate expenseDate;

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDate getExpenseDate() {
            return expenseDate;
        }

        public void setExpenseDate(LocalDate expenseDate) {
            this.expenseDate = expenseDate;
        }
    }

    public static class Response {
        private Long expenseId;
        private String category;
        private BigDecimal amount;
        private String description;
        private LocalDate expenseDate;
        private LocalDateTime createdTime;

        public Long getExpenseId() {
            return expenseId;
        }

        public void setExpenseId(Long expenseId) {
            this.expenseId = expenseId;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDate getExpenseDate() {
            return expenseDate;
        }

        public void setExpenseDate(LocalDate expenseDate) {
            this.expenseDate = expenseDate;
        }

        public LocalDateTime getCreatedTime() {
            return createdTime;
        }

        public void setCreatedTime(LocalDateTime createdTime) {
            this.createdTime = createdTime;
        }
    }

    public static class SummaryResponse {
        private BigDecimal totalExpenses;
        private BigDecimal monthlyExpenses;
        private java.util.Map<String, BigDecimal> categoryBreakdown;
        private java.util.List<Response> recentExpenses;

        public BigDecimal getTotalExpenses() {
            return totalExpenses;
        }

        public void setTotalExpenses(BigDecimal totalExpenses) {
            this.totalExpenses = totalExpenses;
        }

        public BigDecimal getMonthlyExpenses() {
            return monthlyExpenses;
        }

        public void setMonthlyExpenses(BigDecimal monthlyExpenses) {
            this.monthlyExpenses = monthlyExpenses;
        }

        public java.util.Map<String, BigDecimal> getCategoryBreakdown() {
            return categoryBreakdown;
        }

        public void setCategoryBreakdown(java.util.Map<String, BigDecimal> categoryBreakdown) {
            this.categoryBreakdown = categoryBreakdown;
        }

        public java.util.List<Response> getRecentExpenses() {
            return recentExpenses;
        }

        public void setRecentExpenses(java.util.List<Response> recentExpenses) {
            this.recentExpenses = recentExpenses;
        }
    }
}
