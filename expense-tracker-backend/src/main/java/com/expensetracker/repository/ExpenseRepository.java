package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserOrderByExpenseDateDesc(User user);

    List<Expense> findByUserAndCategoryOrderByExpenseDateDesc(User user, String category);

    List<Expense> findTop5ByUserOrderByCreatedTimeDesc(User user);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user")
    BigDecimal getTotalExpenseByUser(@Param("user") User user);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user " +
           "AND MONTH(e.expenseDate) = MONTH(CURRENT_DATE) " +
           "AND YEAR(e.expenseDate) = YEAR(CURRENT_DATE)")
    BigDecimal getMonthlyExpenseByUser(@Param("user") User user);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.category")
    List<Object[]> getCategoryWiseExpense(@Param("user") User user);
}
