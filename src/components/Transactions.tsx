import * as React from "react";
import {Transaction} from "../models/Transaction";
import {Loader} from "semantic-ui-react";
import {api} from "../services/Api";
import "./Transactions.css";
import {Link} from "react-router-dom";

interface State {
    transactions: Transaction[];
    loading: boolean;
    currentlyDeletingTransaction: Transaction | null;
}

export class Transactions extends React.Component<{}, State> {

    constructor(props:{}) {
        super(props);

        this.state = {
            transactions: [],
            loading: true,
            currentlyDeletingTransaction: null
        };
    }

    componentDidMount() {
        this.fetchTransactions();
    }

    render() {
        const {loading} = this.state;
        return (
            <div>
                <h3>Your non-automatic transactions</h3>
                {loading ? <Loader size={"large"} active={true}/> : this.renderTransactions()}
                {}
            </div>
        );
    }

    private fetchTransactions() {
        api.get<Transaction[]>(`/transaction/all`)
            .then(resp => {
                this.setState({
                    transactions: resp.data,
                    loading: false
                })
            })
            .catch(err => {
                // TODO
            });
    }

    private renderTransactions() {
        const {transactions} = this.state;

        if (transactions.length === 0) {
            return <div>No transactions found</div>
        } else {
            return (
                <table className={"transaction-table"}>
                    <thead>
                        <th className={'header description'}>Description</th>
                        <th className={'header price'}>Price</th>
                        <th className={'header empty'}/>
                        <th className={'header edit'}/>
                        <th className={'header delete'}/>
                    </thead>
                    <tbody>
                        {transactions.map((transaction: Transaction) => {
                            return (
                                <tr className="transaction-item" key={transaction.id}>
                                    <td className={'data-row description'}>{transaction.description}</td>
                                    <td className={'data-row price'}>${transaction.price.toFixed(2)}</td>
                                    <th className={'data-row empty'}/>
                                    <td className={'data-row edit'}>{this.renderEditCell(transaction)}</td>
                                    <td className={'data-row delete'}>{this.renderDeleteCell(transaction)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )
        }
    }

    private renderEditCell = (transaction: Transaction) => {
        return <Link to={`/transaction/${transaction.id}`} className={"link"}>Edit</Link>;
    };

    private renderDeleteCell = (transaction: Transaction) => {
        const {currentlyDeletingTransaction} = this.state;

        if (currentlyDeletingTransaction === transaction) {
            return (
                <div>
                    Are you sure?
                    <div className="link" onClick={() => this.deleteTransaction(transaction)}>Yes</div> /
                    <div className="link" onClick={() => this.setState({currentlyDeletingTransaction: null})}> No</div>
                </div>
            );
        } else {
            return <div className="link" onClick={() => this.setState({currentlyDeletingTransaction: transaction})}>Delete</div>;
        }
    };

    private deleteTransaction(transaction: Transaction) {
        api.delete(`/transaction/${transaction.id}`)
            .then(resp => this.fetchTransactions())
            .catch(err => {
                // TODO
            });
    }
}
