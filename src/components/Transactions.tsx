import * as React from "react";
import {Transaction} from "../models/Transaction";
import {Loader, Message} from "semantic-ui-react";
import {api} from "../services/Api";
import "./Transactions.css";
import {Link} from "react-router-dom";

interface State {
    transactions: Transaction[];
    loading: boolean;
    currentlyDeletingTransaction: Transaction | undefined;
    errorMessage: string | undefined;
    deletingItem: boolean;
    balance: number | undefined;
    loadingBalance: boolean;
    balanceError: boolean;
}

export class Transactions extends React.Component<{}, State> {

    constructor(props:{}) {
        super(props);

        this.state = {
            deletingItem: false,
            transactions: [],
            loading: true,
            currentlyDeletingTransaction: undefined,
            errorMessage: undefined,
            balanceError: false,
            loadingBalance: true,
            balance: undefined
        };
    }

    componentDidMount() {
        this.fetchTransactions();
        this.fetchBalance();
    }

    render() {
        const {loading, errorMessage, loadingBalance, balanceError} = this.state;
        return (
            <div>
                <h3>Your Current Balance</h3>
                {loadingBalance && !balanceError ? <Loader size={"mini"} active={true} inline={true}/> : this.renderBalance()}
                <h3>Your Transactions</h3>
                {loading && !errorMessage ? <Loader size={"small"} active={true} inline={true}/> : this.renderTransactions()}
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

    private fetchBalance() {
        api.get<{balance: number}>(`/user/balance`)
            .then(resp => {
                this.setState({
                    balance: resp.data.balance,
                    loadingBalance: false
                })
            })
            .catch(() => {
                this.setState({balanceError: true});
            });
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

    private renderBalance() {
        const {balanceError, balance} = this.state;

        if (balanceError) {
            return <div>Unable to get balance at this time</div>;
        } else if (balance === undefined) {
            return null;
        } else {
            return <div>{`$${balance.toFixed(2)}`}</div>;
        }
    }

    private renderTransactions() {
        const {transactions} = this.state;

        if (transactions.length === 0) {
            return <div>No transactions found</div>
        } else {
            return (
                <table className={"transaction-table"}>
                    <thead>
                        <tr className={'header'}>
                            <th>Description</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction: Transaction) => {
                            return (
                                <tr className="transaction-item" key={transaction.id}>
                                    <td className={'data-row description'}>{transaction.description}</td>
                                    <td className={'data-row price'}>${transaction.price.toFixed(2)}</td>
                                    <td className={'data-row empty'}/>
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
        const {currentlyDeletingTransaction, deletingItem} = this.state;

        if (currentlyDeletingTransaction === transaction) {
            if (deletingItem) {
                return <div><Loader inline={true} active={true} size={"mini"}/></div>
            } else {
                return (
                    <div>
                        <span>Are you sure?  </span>
                        <span className="link" onClick={() => this.deleteTransaction(transaction)}>Yes</span> /
                        <span className="link" onClick={() => this.setState({currentlyDeletingTransaction: undefined})}> No</span>
                    </div>
                );
            }
        } else {
            return <div className="link" onClick={() => this.setState({currentlyDeletingTransaction: transaction})}>Delete</div>;
        }
    };

    private deleteTransaction(transaction: Transaction) {
        const {transactions} = this.state;
        this.setState({errorMessage: undefined, deletingItem: true});
        api.delete(`/transaction/${transaction.id}`)
            .then(resp => {
                // Remove transaction from front-end, don't call back-end for current transactions to make it look smoother
                const idx = transactions.indexOf(transaction);
                const newTransactions = [
                    ...transactions.slice(0, idx),
                    ...transactions.slice(idx + 1)
                ];
                this.setState({deletingItem: false, transactions: newTransactions});
                this.fetchTransactions()
            })
            .catch(() => {
                this.setState({deletingItem: false});
                this.setState({errorMessage: "An error occurred while trying to delete your item. Try again later."});
            });
    }
}
