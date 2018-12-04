import * as React from "react";
import {Transaction} from "../models/Transaction";
import {Form, Loader, Message} from "semantic-ui-react";
import {api} from "../services/Api";
import "./Transactions.css";
import {Link} from "react-router-dom";

interface State {
    transactions: Transaction[];
    loading: boolean;
    currentlyDeletingTransaction: Transaction | undefined;
    errorMessage: string | undefined;
}

export class Transactions extends React.Component<{}, State> {

    constructor(props:{}) {
        super(props);

        this.state = {
            transactions: [],
            loading: true,
            currentlyDeletingTransaction: undefined,
            errorMessage: undefined
        };
    }

    componentDidMount() {
        this.fetchTransactions();
    }

    render() {
        const {loading, errorMessage} = this.state;
        return (
            <div>
                <h3>Your Transactions</h3>
                {loading && !errorMessage ? <Loader size={"large"} active={true}/> : this.renderTransactions()}
                <Link to={"/transaction"}>
                    <div className={"link create-new"}>
                        Create New Transaction
                    </div>
                </Link>
                {
                    errorMessage === undefined ? null :
                        <Message
                            error={true}
                            header={"An error occurred"}
                            content={errorMessage}
                        />
                }
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
            .catch(() => {
                this.setState({errorMessage: "An error occurred while trying to find your items. Try again later."});
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
                    <span>Are you sure?  </span>
                    <span className="link" onClick={() => this.deleteTransaction(transaction)}>Yes</span> /
                    <span className="link" onClick={() => this.setState({currentlyDeletingTransaction: undefined})}> No</span>
                </div>
            );
        } else {
            return <div className="link" onClick={() => this.setState({currentlyDeletingTransaction: transaction})}>Delete</div>;
        }
    };

    private deleteTransaction(transaction: Transaction) {
        this.setState({errorMessage: undefined});
        api.delete(`/transaction/${transaction.id}`)
            .then(resp => this.fetchTransactions())
            .catch(() => {
                this.setState({errorMessage: "An error occurred while trying to delete your item. Try again later."});
            });
    }
}
