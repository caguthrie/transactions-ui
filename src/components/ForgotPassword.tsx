import * as React from 'react';
import {Button, Form, Input, InputOnChangeData, Message} from "semantic-ui-react";
import {api} from "../services/Api";
import {AxiosError} from "axios";

interface State {
    loading: boolean;
    email: string;
    errorMessage: string | undefined;
    emailSent: boolean;
}

export class ForgotPassword extends React.Component<{}, State> {
    state: State = {
        loading: false,
        email: '',
        errorMessage: undefined,
        emailSent: false
    };

    render() {
        const {email, emailSent, errorMessage, loading} = this.state;
        return (
            <div>
                <h3>Forgot password?</h3>
                <Form error={!!(emailSent || errorMessage)}>
                    <Form.Field>
                        <label>Please enter your email to reset your password:</label>
                        <Input style={{maxWidth: "300px"}} value={email} onChange={this.onChangeEmail}/>
                    </Form.Field>
                    <Button loading={loading} type={"submit"} onClick={this.onSubmit}>Submit</Button>
                    {
                        emailSent || errorMessage ?
                            <Message
                                error={errorMessage !== undefined}
                                header={errorMessage ? "Error" : "Email sent"}
                                content={errorMessage || "Please follow instructions in email to complete password change."}
                            /> : null
                    }
                </Form>
            </div>
        );
    }

    private onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({email: data.value});
    };

    private onSubmit = () => {
        const {email, loading} = this.state;
        if (!loading) {
            this.setState({errorMessage: undefined});

            if (!validateEmail(email)) {
                this.setState({errorMessage: "Please enter a valid email address"});
                return;
            }

            this.setState({loading: true});
            api.post("/user/forgot-password", {email: email.trim()})
                .then(() => this.setState({emailSent: true, loading: false}))
                .catch( (e) => {
                    const error:AxiosError = e;
                    if (error.response && error.response.status === 401) {
                        this.setState({errorMessage: "I don't recognize that email. Please try again.", loading: false})
                    } else {
                        this.setState({errorMessage: "There was an issue with the server. Please try again later.", loading: false})
                    }
                });
        }
    };
}

// Email address regex validator https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email: string) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
