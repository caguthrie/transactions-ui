import * as React from 'react';
import {Button, Form, Input, InputOnChangeData, Message} from "semantic-ui-react";
import {api} from "../services/Api";
import {RouteComponentProps} from "react-router";
import {AxiosError} from "axios";

interface Props extends RouteComponentProps<any>{
    onReceiveAuth: () => void;
}

interface State {
    loading: boolean;
    password: string;
    passwordConfirmation: string;
    errorMessage: string | undefined;
    success: boolean;
    email: string;
    changePasswordToken: string;
}

export class ChangePassword extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            password: "",
            passwordConfirmation: "",
            errorMessage: undefined,
            success: false,
            // Extract params from url
            email: getURLParam("email"),
            changePasswordToken: getURLParam("token")
        };
    }

    render() {
        const {passwordConfirmation, password, success, errorMessage, email, changePasswordToken, loading} = this.state;
        if (!email || !changePasswordToken) {
            return <div>Please click a forgot password link from your email to visit this page.</div>
        } else {
            return(
                <div>
                    <Form error={!!(success || errorMessage)}>
                        <Form.Field>
                            <label>New Password:</label>
                            <Input type={"password"} className={"input-box"} value={password} onChange={this.onChangePassword}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Confirm new Password:</label>
                            <Input type={"password"} className={"input-box"} value={passwordConfirmation} onChange={this.onChangePasswordConfirmation}/>
                        </Form.Field>
                        <Button loading={loading} type={"submit"} onClick={this.onSubmit}>Submit</Button>
                        {
                            success || errorMessage ?
                                <Message
                                    error={errorMessage !== undefined}
                                    header={errorMessage ? "Error" : "Success!"}
                                    content={errorMessage || "Please wait a couple seconds while we log you in."}
                                /> : null
                        }
                    </Form>
                </div>
            );
        }
    }

    private onChangePassword = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({password: data.value});
    };

    private onChangePasswordConfirmation = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({passwordConfirmation: data.value});
    };

    private onSubmit = () => {
        const {history, onReceiveAuth} = this.props;
        const {password, passwordConfirmation, email, changePasswordToken, loading} = this.state;
        if (!loading) {
            this.setState({errorMessage: undefined});
            if (password !== passwordConfirmation) {
                this.setState({errorMessage: "Passwords do not match. Please try again."});
            } else {
                this.setState({loading: true});
                api.post("/user/change-password", {
                    changePasswordToken,
                    email,
                    password
                })
                    .then(resp => {
                        api.post<{token: string}>(`/user/login`, {email, password})
                            .then(resp => {
                                localStorage.setItem("auth", resp.data.token);
                                onReceiveAuth();
                                history.push("/transactions");
                            })
                            .catch((err: AxiosError) => {
                                console.log(err);
                                this.setState({errorMessage: "Password changed, but unable to log in. Please visit the main page and try to log in."})
                            });
                    })
                    .catch(err => this.setState({errorMessage: "Unable to change password. Try again later.", loading: false}))
            }
        }
    };
}

function getURLParam(param: string): string {
    const url = new URL(window.location.href);
    return url.searchParams.get(param) || "";
}
