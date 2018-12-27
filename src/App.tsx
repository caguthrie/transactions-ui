import React, {Component} from 'react';
import {HashRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import {Login} from "./components/Login";
import "./App.css";
import {Transactions} from "./components/Transactions";
import {Transaction} from "./components/Transaction";
import {ForgotPassword} from "./components/ForgotPassword";
import {ChangePassword} from "./components/ChangePassword";

interface State {
    hasAuth: boolean;
}

class App extends Component<{}, State> {
    state = {
        hasAuth: !!localStorage.getItem("auth")
    };

    render() {
        const {hasAuth} = this.state;
        return (
            <Router>
                <div className={"main-container"}>
                    {hasAuth ? <a onClick={this.logOut} className={"logout"}>Log out</a> : null}
                    <Switch>
                        <Route path={"/forgot-password"} render={() => <ForgotPassword/>}/>
                        <Route path={"/change-password"} render={props => <ChangePassword {...props}/>}/>
                        <Route path={"/login"} render={() => <Login onReceiveAuth={this.onReceiveAuth}/>}/>
                        <Route path={"/transactions"} render={() => hasAuth ? <Transactions /> : <Redirect to={"/login"}/>}/>
                        <Route path={"/transaction/:id"} render={props => hasAuth ? <Transaction {...props} /> : <Redirect to={"/login"}/>}/>
                        <Route path={"/transaction"} render={props => hasAuth ? <Transaction {...props} /> : <Redirect to={"/login"}/>}/>
                        <Redirect to={hasAuth ? "/transactions" : "/login"}/>
                    </Switch>
                </div>
            </Router>
        );
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
