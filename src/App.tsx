import React, {Component} from 'react';
import {HashRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import {Login} from "./components/Login";
import "./App.css";
import {Transactions} from "./components/Transactions";
import {Transaction} from "./components/Transaction";
import {ForgotPassword} from "./components/ForgotPassword";
import {ChangePassword} from "./components/ChangePassword";
import {api} from "./services/Api";
import {AxiosError} from "axios";
import {Loader} from "semantic-ui-react";
import {NewUser} from "./components/NewUser";

interface State {
    authLoading: boolean;
    hasAuth: boolean;
}

class App extends Component<{}, State> {
    state = {
        authLoading: true,
        hasAuth: false
    };

    componentDidMount() {
        const auth = localStorage.getItem("auth");
        if (auth) {
            api.get<{token: string}>(`/user/validate-token`)
                .then(resp => this.setState({hasAuth: true, authLoading: false}))
                .catch((err: AxiosError) => this.logOut());
        } else {
            this.setState({authLoading: false});
        }
    }

    render() {
        const {hasAuth, authLoading} = this.state;

        if (authLoading) {
            return <Loader active={true} size={"large"}/>
        } else {
            return (
                <Router>
                    <div className={"main-container"}>
                        {hasAuth ? <a onClick={this.logOut} className={"logout"}>Log out</a> : null}
                        <Switch>
                            <Route path={"/new-user"} render={props => <NewUser {...props} onReceiveAuth={this.onReceiveAuth}/>}/>
                            <Route path={"/forgot-password"} render={() => <ForgotPassword/>}/>
                            <Route path={"/change-password"} render={props => <ChangePassword {...props} onReceiveAuth={this.onReceiveAuth}/>}/>
                            <Route path={"/login"} render={() => hasAuth ? <Redirect to={"/transactions"}/> : <Login onReceiveAuth={this.onReceiveAuth}/>}/>
                            <Route path={"/transactions"} render={() => hasAuth ? <Transactions /> : <Redirect to={"/login"}/>}/>
                            <Route path={"/transaction/:id"} render={props => hasAuth ? <Transaction {...props} /> : <Redirect to={"/login"}/>}/>
                            <Route path={"/transaction"} render={props => hasAuth ? <Transaction {...props} /> : <Redirect to={"/login"}/>}/>
                            <Redirect to={hasAuth ? "/transactions" : "/login"}/>
                        </Switch>
                    </div>
                </Router>
            );
        }
    }

    private logOut = () => {
        localStorage.removeItem("auth");
        if (document.location) {
            document.location.reload();
        }
    };

    private onReceiveAuth = () => this.setState({hasAuth: true});
}

export default App;
