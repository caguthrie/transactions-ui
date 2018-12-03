import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import {Login} from "./components/Login";
import "./App.css";
import {Transactions} from "./components/Transactions";
import {Transaction} from "./components/Transaction";

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
                    <Switch>
                        <Route path={"/login"} render={() => <Login onReceiveAuth={this.onReceiveAuth}/>}/>
                        <Route path={"/transactions"} render={() => hasAuth ? <Transactions /> : <Redirect to={"/login"}/>}/>
                        <Route path={"/transaction/:id"} render={(props) => hasAuth ? <Transaction {...props} /> : <Redirect to={"/login"}/>}/>
                        <Route path={"/transaction"} render={(props) => hasAuth ? <Transaction {...props} /> : <Redirect to={"/login"}/>}/>
                        <Redirect to={hasAuth ? "/transactions" : "/login"}/>
                    </Switch>
                </div>
            </Router>
        );
    }

    onReceiveAuth = () => this.setState({hasAuth: true});
}

export default App;
