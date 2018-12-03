import * as React from 'react';
import {Transaction as TransactionModel} from "../models/Transaction";
import {Button, Form, InputOnChangeData, Loader} from "semantic-ui-react";
import {Input} from "semantic-ui-react";
import {api} from "../services/Api";
import {RouteComponentProps, withRouter} from "react-router";

interface Props extends RouteComponentProps<{id: string}>{
}

interface State {
    transactionToEdit?: TransactionModel;
    description: string;
    price: number | undefined;
}

export const Transaction = withRouter(
    class Component extends React.Component<Props, State> {
        constructor(props: Props) {
            super(props);
            this.state = {
                description: '',
                price: undefined
            };
        }

        componentDidMount() {
            const {match} = this.props;
            if (match.params.id) {
                this.fetchTransaction(match.params.id);
            }
        }

        render() {
            const {match} = this.props;
            const {price, description, transactionToEdit} = this.state;

            if (match.params.id && !transactionToEdit) {
                return <Loader active={true} size={"large"}/>;
            } else {
                return (
                    <Form>
                        <h3>{transactionToEdit ? "Edit" : "Create"} a transaction:</h3>
                        <Form.Field>
                            <label>Description:</label>
                            <Input style={{maxWidth: "300px"}} onChange={this.onChangeDescription} value={description} />
                        </Form.Field>
                        <Form.Field>
                            <label>Price:</label>
                            <Input style={{maxWidth: "300px"}} type={"number"} onChange={this.onChangePrice} value={price}/>
                        </Form.Field>
                        <Button type={"submit"} onClick={this.onClick}>Submit</Button>
                    </Form>
                );
            }
        }

        private fetchTransaction(id: string) {
            api.get<TransactionModel>(`/transaction/${id}`)
                .then(({data}) => this.setState({
                    description: data.description,
                    price: data.price,
                    transactionToEdit: data
                }))
                .catch(err => {
                    // TODO error handling
                });
        }

        private onClick = () => {
            const {history} = this.props;
            const {transactionToEdit, description, price} = this.state;

            if (transactionToEdit) {
                api.put("/transaction/update", {
                    ...transactionToEdit,
                    description,
                    price
                })
                    .then(resp => history.push("/transactions"))
                    .catch(err => {
                        // TODO
                    });
            } else {
                api.post("/transaction/create", {description, price})
                    .then(resp => history.push("/transactions"))
                    .catch(err => {
                        // TODO
                    });
            }
        };

        private onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({description: data.value});
        };

        private onChangePrice = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({price: parseFloat(data.value)});
        };
    }
);
