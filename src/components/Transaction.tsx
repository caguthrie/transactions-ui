import * as React from 'react';
import {Transaction as TransactionModel} from "../models/Transaction";
import {Button, Form, InputOnChangeData, Loader, Message} from "semantic-ui-react";
import {Input} from "semantic-ui-react";
import {api} from "../services/Api";
import {RouteComponentProps, withRouter} from "react-router";

interface Props extends RouteComponentProps<{id: string}>{
}

interface State {
    loading: boolean;
    transactionToEdit?: TransactionModel;
    description: string;
    price: number | undefined;
    errorMessage: string | undefined;
}

export const Transaction = withRouter(
    class Component extends React.Component<Props, State> {
        constructor(props: Props) {
            super(props);
            this.state = {
                loading: false,
                description: '',
                price: undefined,
                errorMessage: undefined
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
            const {price, description, transactionToEdit, errorMessage, loading} = this.state;

            if (match.params.id && !transactionToEdit) {
                if (errorMessage) {
                    return (
                        <Message
                            error={true}
                            header={"An error occurred"}
                            content={errorMessage}
                        />
                    );
                } else {
                    return <Loader inline={true} active={true} size={"large"}/>;
                }
            } else {
                return (
                    <Form error={!!errorMessage}>
                        <a onClick={this.goBack} style={{cursor: "pointer"}}>Go Back</a>
                        <h3>{transactionToEdit ? "Edit" : "Create"} a transaction:</h3>
                        <Form.Field>
                            <label>Description:</label>
                            <Input className={"input-box"} onChange={this.onChangeDescription} value={description} />
                        </Form.Field>
                        <Form.Field>
                            <label>Price:</label>
                            <Input className={"input-box"} type={"number"} onChange={this.onChangePrice} value={price || ''}/>
                        </Form.Field>
                        <Button loading={loading} type={"submit"} onClick={this.onClick}>Submit</Button>
                        {
                            errorMessage ?
                                <Message
                                    error={!!errorMessage}
                                    header={"An error occurred"}
                                    content={errorMessage}
                                /> : null
                        }
                    </Form>
                );
            }
        }

        private goBack = () => this.props.history.goBack();

        private fetchTransaction(id: string) {
            api.get<TransactionModel>(`/transaction/${id}`)
                .then(({data}) => this.setState({
                    description: data.description,
                    price: data.price,
                    transactionToEdit: data
                }))
                .catch(err => {
                    this.setState({errorMessage: "Unable to find this item!"});
                });
        }

        private onClick = () => {
            const {history} = this.props;
            const {transactionToEdit, description, price, loading} = this.state;

            if (!loading) {
                this.setState({errorMessage: undefined, loading: true});

                if (transactionToEdit) {
                    api.put("/transaction/update", {
                        ...transactionToEdit,
                        description,
                        price
                    })
                        .then(() => history.push("/transactions"))
                        .catch(() => {
                            this.setState({errorMessage: "Unable to update this item!", loading: false});
                        });
                } else {
                    api.post("/transaction/create", {description, price})
                        .then(() => history.push("/transactions"))
                        .catch(() => {
                            this.setState({errorMessage: "Unable to create this item! Please try again", loading: false});
                        });
                }
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
