import * as React from 'react';
import {Input, InputOnChangeData, Form, Button, Message} from "semantic-ui-react";
import {validateEmail} from "../utils/emailUtils";
import {api} from "../services/Api";
import {AxiosError} from "axios";
import {RouteComponentProps, withRouter} from "react-router";

interface Props extends RouteComponentProps<any>{
    onReceiveAuth: () => void;
}

interface State {
    // User related fields
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    emailPassword: string;
    recordsEmail: string;
    balance: number | undefined;

    // Special password to be able to sign up
    userCreationPassword: string;

    // UI related state
    loading: boolean;
    errorMessage: string | undefined;
}

export const NewUser = withRouter(
    class Component extends React.Component<Props, State> {
        state: State = {
            // User related fields
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
            emailPassword: '',
            recordsEmail: '',
            balance: 0,

            // Special password to be able to sign up
            userCreationPassword: '',

            // UI related state
            loading: false,
            errorMessage: undefined
        };

        render() {
            const {name, email, password, passwordConfirmation, emailPassword, recordsEmail, balance, userCreationPassword, loading, errorMessage} = this.state;
            return (
                <Form error={!!errorMessage}>
                    <h3>Create an account:</h3>
                    <Form.Field>
                        <label>What is your name?</label>
                        <Input className={"input-box"} onChange={this.onChangeName} value={name} />
                    </Form.Field>
                    <Form.Field>
                        <label>Please create a gmail address to store your receipts and type that address here. This will also be your login to this site:</label>
                        <Input className={"input-box"} onChange={this.onChangeEmail} value={email} />
                    </Form.Field>
                    <Form.Field>
                        <label>{`Please type in your password you use to log into gmail for the email address in the previous field:`}</label>
                        <Input type={"password"} className={"input-box"} onChange={this.onChangeEmailPassword} value={emailPassword} />
                    </Form.Field>
                    <Form.Field>
                        <label>Please type in a new password to log into this site:</label>
                        <Input type={"password"} className={"input-box"} onChange={this.onChangePassword} value={password} />
                    </Form.Field>
                    <Form.Field>
                        <label>Please re-type in the new password to log into this site:</label>
                        <Input type={"password"} className={"input-box"} onChange={this.onChangePasswordConfirmation} value={passwordConfirmation} />
                    </Form.Field>
                    <Form.Field>
                        <label>Please type in an email address to receive daily itemized bills:</label>
                        <Input className={"input-box"} onChange={this.onChangeRecordsEmail} value={recordsEmail} />
                    </Form.Field>
                    <Form.Field>
                        <label>What is your current balance? If there is none, enter 0:</label>
                        <Input type={"number"} className={"input-box"} onChange={this.onChangeBalance} value={balance === undefined ? '' : balance} />
                    </Form.Field>
                    <Form.Field>
                        <label>What is the special password that was given to you to sign up:</label>
                        <Input className={"input-box"} onChange={this.onChangeUserCreationPassword} value={userCreationPassword} />
                    </Form.Field>
                    <Button loading={loading} type={"submit"} onClick={this.onSubmit}>Submit</Button>
                    {
                        errorMessage ?
                            <Message
                                error={!!errorMessage}
                                header={"Error"}
                                content={errorMessage}
                            /> : null
                    }
                </Form>
            );
        }

        private onSubmit = () => {
            const {onReceiveAuth, history} = this.props;
            const {name, email, password, passwordConfirmation, emailPassword, recordsEmail, balance, userCreationPassword} = this.state;

            this.setState({errorMessage: undefined});
            if (name.length === 0) {
                this.setState({errorMessage: "Please enter a name."})
            } else if (password.length < 4) {
                this.setState({errorMessage: "Please enter a password at least 4 characters in length."})
            } else if (password !== passwordConfirmation) {
                this.setState({errorMessage: "The new password you created does not match. Please try again."})
            } else if (!validateEmail(email) || !email.match(/@gmail\.com$/)) {
                this.setState({errorMessage: "The new gmail address you created is not valid or is not a gmail address. Please try again."})
            } else if (!validateEmail(recordsEmail)) {
                this.setState({errorMessage: "The email address you are choosing to send itemized bills to is not valid. Please try again."})
            } else if (balance === undefined) {
                this.setState({errorMessage: "Please enter a valid balance. If there is no current balance, enter 0"})
            } else if (userCreationPassword.length === 0) {
                this.setState({errorMessage: "Please enter the special password that was given to you to sign up."})
            } else {
                // Passes front-end validations
                api.post<{token: string}>("/user/create", {
                    name,
                    email,
                    password,
                    emailPassword,
                    recordsEmail,
                    balance,
                    userCreationPassword
                }).then((resp) => {
                    localStorage.setItem("auth", resp.data.token);
                    onReceiveAuth();
                    history.push("/transactions");
                }).catch((error: AxiosError) => {
                    if (error.response) {
                        switch (error.response.status) {
                            case 403:
                                this.setState({errorMessage: "Incorrect special signup password."});
                                return;
                            case 409:
                                this.setState({errorMessage: `A user with the email address ${email} already exists. Please sign in normally or use 'forgot password' if you forgot your password.`});
                                return;
                            case 415:
                                this.setState({errorMessage: `Tried to log into gmail account ${email} and using the gmail password you provided but it failed. Please check that and try again.`});
                                return;
                            case 422:
                                this.setState({errorMessage: "Please verify you have filled out all the fields."});
                                return;
                            case 500:
                                this.setState({errorMessage: "A server error occurred. Please try again later."});
                                return;
                        }
                    } else {
                        this.setState({errorMessage: "A server error occurred. Please contact developer."});
                    }
                });
            }
        };

        private onChangeName = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({name: data.value});
        };

        private onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({email: data.value});
        };

        private onChangePassword = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({password: data.value});
        };

        private onChangePasswordConfirmation = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({passwordConfirmation: data.value});
        };

        private onChangeEmailPassword = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({emailPassword: data.value});
        };

        private onChangeRecordsEmail = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({recordsEmail: data.value});
        };

        private onChangeBalance = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({balance: data.value === undefined ? undefined : parseFloat(data.value)});
        };

        private onChangeUserCreationPassword = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({userCreationPassword: data.value});
        };
    }
);
