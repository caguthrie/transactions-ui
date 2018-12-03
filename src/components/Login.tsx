import * as React from "react";
import {Form, Input, Message, Button, InputOnChangeData} from "semantic-ui-react";
import {AxiosError} from "axios";
import {RouteComponentProps, withRouter} from "react-router";
import {api} from "../services/Api";

interface Props extends RouteComponentProps<any>{
    onReceiveAuth: () => void;
}

interface State {
    email: string;
    password: string;
    errorStatusCode: number | null;
}

export const Login = withRouter(
    class Component extends React.Component<Props, State> {
        state = {
            email: '',
            password: '',
            errorStatusCode: null
        };

        render() {
            const {email, password, errorStatusCode} = this.state;
            return (
                <Form error={errorStatusCode !== null}>
                    <h3>Please Login:</h3>
                    <Form.Field>
                        <label>Email:</label>
                        <Input style={{maxWidth: "300px"}} onChange={this.onChangeEmail} value={email} />
                    </Form.Field>
                    <Form.Field>
                        <label>Password:</label>
                        <Input style={{maxWidth: "300px"}} type={"password"} onChange={this.onChangePassword} value={password}/>
                    </Form.Field>
                    <Button type={"submit"} onClick={this.onClick}>Submit</Button>
                    {
                        errorStatusCode === null ? null :
                            <Message
                                error={true}
                                header={this.renderErrorHeader()}
                                content={this.renderErrorContent()}
                            />
                    }
                </Form>
            );
        }

        private renderErrorHeader(): string {
            const {errorStatusCode} = this.state;
            if (errorStatusCode !== null) {
                switch (errorStatusCode) {
                    case 401:
                        return "Incorrect credentials";
                    default:
                        return "Invalid input";

                }
            } else {
                return "No error found";
            }
        }

        private renderErrorContent() {
            const {errorStatusCode} = this.state;
            if (errorStatusCode !== null) {
                switch (errorStatusCode) {
                    case 401:
                        return "Your email/password combination was incorrect. Please try again.";
                    default:
                        return "Please enter an email and password.";

                }
            } else {
                return "You shouldn't be seeing this";
            }
        }

        private onClick = () => {
            const {history, onReceiveAuth} = this.props;
            const {email, password} = this.state;
            this.setState({errorStatusCode: null});
            if (email && password) {
                api.post<{token: string}>(`/user/login`, {email, password})
                    .then(resp => {
                        localStorage.setItem("auth", resp.data.token);
                        onReceiveAuth();
                        history.push("/transactions");
                    })
                    .catch((err: AxiosError) => {
                        console.log(err);
                        this.setState({errorStatusCode: 401})
                    });
            } else {
                this.setState({errorStatusCode: 999});
            }
        };

        private onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({email: data.value});
        };

        private onChangePassword = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            this.setState({password: data.value});
        };
    }

);