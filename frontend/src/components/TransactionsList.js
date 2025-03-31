import React from "react";

const TransactionsList = ({transactions, categories = []}) => (
    <div className="card mt-1">
        <table>
            <thead>
            <tr>
                <th>Data</th>
                <th>Descrizione</th>
                <th>Categoria</th>
                <th>Importo</th>
            </tr>
            </thead>
            <tbody>
            {transactions.map(t => (
                <tr key={t.transactionid}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.description}</td>
                    <td>{categories.find(c => c.categoryId === t.categoryId)?.name || "N/A"}</td>
                    <td className={t.amount < 0 ? "text-danger" : "text-success"}>
                        {t.amount} {t.currency}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default TransactionsList;