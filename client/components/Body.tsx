import React from "react"
import { Loader, Header, Icon, List } from "semantic-ui-react"
import styled from "styled-components"
import moment, { Moment } from "moment"
import "react-datepicker/dist/react-datepicker.css"
import "semantic-ui-css/semantic.min.css";
import "/css/Body.css"
import "../css/Animation.css"
import { getApiUrl } from "../share/Configuration"
import { LoggerApi, Log, GetEmail, GetUsers } from "../share/LoggerApi"
import { LogList } from "./LogList"
import { HubConnectionBuilder } from "@aspnet/signalr";
import { debounce } from "throttle-debounce";
import { Route, Switch, Link } from "react-router-dom";
import { Chart } from "./Chart";
import { Manage } from "./Manage";
import { Line } from "./Line";
import { UserList } from "./UserList"
import swal from "sweetalert2"
import { scaleDown as Menu } from "react-burger-menu"

type Props = {
    onLogoutPlease: () => void
}

const BodyDiv = styled.div`
  flex-direction: column;
  justify-content: center;
  position: absolute;
  width:100%;
  height: 95%;
  padding: 1.5em;
  position: relative;
  min-width: 950px;
`

type State = {
    selectDay: Moment
    endDay: Moment
    startDay: Moment
    allIp: any[]
    allApp: any[]
    selectIp: string
    selectApp: string
    loading: boolean
    logLenght: number
    newSearch: boolean
    logDate: Log[]
    countInfo: number[]
    countError: number[]
    countDebug: number[]
    countTrace: number[]
    countWarning: number[]
    countCritical: number[]
    emailList: GetEmail[]
    allMailApp: any[]
    userList: string[]
    openMenu: boolean
}

export class Body extends React.Component<any, State> {
    private LoggerApi = new LoggerApi(getApiUrl());
    private LogDate: Log[]
    private LogNow: Log[]
    private Limit: number

    constructor(props) {
        super(props)
        this.state = {
            allMailApp: [],
            selectDay: moment(),
            endDay: moment().endOf("day"),
            startDay: moment().startOf("day"),
            allIp: [],
            allApp: [],
            selectIp: "",
            selectApp: "",
            loading: true,
            logLenght: 0,
            newSearch: false,
            logDate: [],
            countInfo: null,
            countDebug: null,
            countError: null,
            countTrace: null,
            countWarning: null,
            countCritical: null,
            emailList: [],
            userList: [],
            openMenu: false,

        }
        this.LogDate = []
        this.LogNow = []
        this.Limit = 1
    }
    public handleStartDateChange = (date) => {
        this.LogDate = []
        this.LogNow = []
        this.Limit = 1
        if (date > this.state.endDay) {
            this.setState({
                logDate: [],
                startDay: date,
                endDay: moment(date).endOf("day")
            });
        } else {
            this.setState({ logDate: [], startDay: date })
        }
        this.initSearchByAll(date.toDate(), this.state.endDay.toDate(), this.state.selectApp, this.state.selectIp)
    }

    public handleEndDateChange = (date) => {
        this.LogDate = []
        this.LogNow = []
        this.Limit = 1
        this.setState({ logDate: [], endDay: date, newSearch: true });
        this.initSearchByAll(this.state.startDay.toDate(), date.toDate(), this.state.selectApp, this.state.selectIp)

    }
    private setIP = (value) => {
        this.Limit = 1
        this.setState({ selectApp: null, selectIp: value, allApp: null, newSearch: true }, () => this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), this.state.selectApp, value))
        this.initGetApp(value);
    }
    private OnMore = () => {
        this.setState({ newSearch: false })
        this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), this.state.selectApp, this.state.selectIp)
    }

    public setApp = (value) => {
        this.Limit = 1
        this.setState({ selectApp: value, newSearch: true })
        this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), value, this.state.selectIp)
    }
    public setDay = (value) => {
        this.initGetChart(value.toDate())
        this.setState({ selectDay: value })
    }
    public initSearchExceptApp = () => {
        this.LoggerApi.SearchExceptApp().then(res => {
            let options = res.data.map(x => ({ value: x, text: x }))
            this.setState({ allMailApp: options })
        })
    }
    public initmailList = () => {
        this.setState({ loading: true })
        this.LoggerApi.ShowMailApp().then(res => {
            this.setState({ emailList: res.data, loading: false })
        })
    }
    public initUserList = () => {
        this.setState({ loading: true })
        this.LoggerApi.ShowAllUser().then(res => {
            this.setState({ userList: res.data, loading: false })
        })
    }
    public initGetChart = (date: Date) => {
        this.LoggerApi.GetDataChart(date).then(response => {
            this.setState({
                countInfo: response.data.dataInfos, countDebug: response.data.dataDebugs, countError: response.data.dataErrors
                , countTrace: response.data.dataTraces, countCritical: response.data.dataCriticals, countWarning: response.data.dataWarnings
            })
        })
    }
    public componentDidMount() {
        // this.initGetApp(this.state.selectIp)
        this.initGetIp()
        let starts = this.state.startDay
        let end = this.state.endDay
        this.initSearchByAll(starts.toDate(), end.toDate(), this.state.selectApp, this.state.selectIp)
        this.initGetChart(this.state.selectDay.toDate())
        this.initSearchExceptApp()
        this.initUserList()
        this.initmailList()
        this.handleSignalR()
    }
    // hacktober 2019 -1
    // hacktober 2019 -2
    // hacktober 2019 -3
     // hacktober 2019 -4
      // hacktober 2019 -5
      // hacktober 2019 -final
    public initSearchByAll = (startDate: Date, endDate: Date, app: string, ip: string) => {
        this.LogDate = []
        this.LogNow = []
        this.setState({ loading: true })
        this.LoggerApi.SearchLog(startDate, endDate, app, ip, this.Limit).then(response => {
            this.LogDate = response.data.logInfo
            this.setState({ loading: false, logDate: response.data.logInfo, logLenght: response.data.dataLength })
            this.Limit = this.Limit + 1
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
            this.setState({ loading: false })
        })
    }
    public initGetIp = () => {
        this.LoggerApi.getIp().then(response => {
            let options = response.data.map(x => ({ value: x, text: x }))
            options.unshift({ value: "", text: "All IP" });
            this.setState({ allIp: options })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    public initGetApp = (ip: string) => {
        this.LoggerApi.getApp(ip).then(response => {
            let options = response.data.map(x => ({ value: x, text: x }))
            options.unshift({ value: "", text: "All Application" });
            this.setState({ allApp: options })
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    private initDeleteApp = (data: string) => {
        this.LoggerApi.DeleteApp(data).then(response => {
            this.initSearchExceptApp()
            this.initmailList()
        })
            .catch(err => {
                if (err.response.status === 401) {
                    this.props.onLogoutPlease()
                }
            })

    }
    public initAddEmails = (data: GetEmail) => {
        this.LoggerApi.AddEmails(data).then(response => {
            swal("Save!", "Save Complete!", "success");
            this.initmailList()
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    public initUpdateEmail = (data: GetEmail) => {
        this.LoggerApi.UpdateEmail(data).then(response => {
            swal("แก้ไขเรียบร้อย!", "", "success");
            this.initmailList()
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
        })
    }
    public initAddUser = (data: GetUsers) => {
        this.LoggerApi.AddUser(data).then(response => {
            swal("บันทึกผู้ใช้เรียบร้อย!", "", "success");
            this.initUserList()
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.onLogoutPlease()
            }
            if (err.response.status === 400) {
                swal("ไม่สามารถบันทึกได้!", "มีผู้ใช้ชื่อนี้แล้ว", "error");
            }
        })
    }
    public initDeleteUser = (data: string) => {
        this.LoggerApi.DeleteUser(data).then(response => {
            this.initSearchExceptApp()
            this.initUserList()
        })
            .catch(err => {
                if (err.response.status === 401) {
                    this.props.onLogoutPlease()
                }
            })
    }
    public handleSignalR() {
        const connection = new HubConnectionBuilder()
            // .withUrl("/LogHub")
            .withUrl(`${getApiUrl()}/LogHub`)
            .build();

        connection.onclose((err) => {
            // alert("SignalR เกิดปัญหาการเชื่อมต่อ");
        });

        connection.on("LogReceived", (log: Log) => {
            this.initGetChart(this.state.startDay.toDate())
            this.LogDate.unshift(log)
            this.updateLogNow();
        });
        // tslint:disable-next-line:no-console
        connection.start().catch(err => console.error(err.toString()));
    }

    private updateLogNow = debounce(250, () => {
        if (this.LogDate.length >= 150) {
            this.Limit = 1
            this.LogDate = []
            this.setState({ logDate: [], newSearch: true })
            this.initSearchByAll(this.state.startDay.toDate(), this.state.endDay.toDate(), this.state.selectApp, this.state.selectIp)
        } else {
            this.setState({ logDate: this.LogDate })
        }
    })
    private onOpenMunu = () => {
        this.setState({ openMenu: false })
    }
    private onNewSave = (newManageList) => {
        this.initAddEmails(newManageList);
    }
    private onEditSave = (editManageList) => {
        this.initUpdateEmail(editManageList)
    }
    private onSaveUser = (newUSer: string, newPass: string) => {
        let newUser: GetUsers = {
            Users: newUSer,
            Password: newPass
        }
        this.initAddUser(newUser)
    }
    private OnDelete = (AppName) => {
        swal({
            title: "ยืนยันการลบการตั้งค่านี้?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ลบ"
        }).then((result) => {
            if (result.value) {
                this.initDeleteApp(AppName)
                swal(
                    "ลบเรียบร้อย!",
                    "",
                    "success"
                )
            }
        })
    }
    private OnDeleteUser = (user) => {
        swal({
            title: "ยืนยันการลบผู้ใช้นี้?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ลบ"
        }).then((result) => {
            if (result.value) {
                this.initDeleteUser(user.toString())
                swal(
                    "ลบเรียบร้อย!",
                    "",
                    "success"
                )
            }
        })
    }

    public render() {
        let allday = moment(this.state.startDay).format("lll").toString() + " ถึง " + moment(this.state.endDay).format("lll").toString()
        let { startDay, endDay, loading, allApp, allIp, selectApp, selectIp, logLenght, newSearch, selectDay,
            countDebug, countError, countInfo, countCritical, countTrace, countWarning, emailList, allMailApp, userList } = this.state
        return (
            <Switch>
                <Route exact path="/" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a" onClick={this.onOpenMunu}>Email</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/line" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="linechat" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Line Account</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">

                                <BodyDiv>
                                    <Loader content="Loading" active={this.state.loading} />

                                    <LogList startDay={startDay} endDay={endDay} logNow={this.LogNow} loading={loading} all={allday}
                                        onStartChange={this.handleStartDateChange} onEndChange={this.handleEndDateChange} allApp={allApp}
                                        allIp={allIp} selectApp={selectApp} selectIp={selectIp} onIpChange={this.setIP} onAppChange={this.setApp}
                                        allData={this.state.logDate} onMore={this.OnMore} logLenght={logLenght} new={newSearch} />
                                </BodyDiv >
                            </main>

                        </div>
                    )
                }} />
                <Route exact path="/summary" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Email</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/line" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="linechat" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Line Account</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <Chart Day={selectDay} onDayChange={this.setDay} info={countInfo} debug={countDebug} error={countError}
                                        trace={countTrace} warning={countWarning} critical={countCritical} />
                                </BodyDiv>
                            </main>
                        </div>
                    )

                }} />
                <Route exact path="/line" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Email</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <Line />
                                </BodyDiv>
                            </main>
                        </div>
                    )

                }} />
                <Route exact path="/manage" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/user" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="users" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">User</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/line" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="linechat" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Line Account</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <Manage allApp={allMailApp} list={emailList} loading={loading}
                                        onNewSave={this.onNewSave} onDelete={this.OnDelete} onEditSave={this.onEditSave}
                                    />
                                </BodyDiv>
                            </main>
                        </div>
                    )
                }} />
                <Route exact path="/user" render={() => {
                    return (
                        <div id="outer-container">
                            <Menu isOpen={this.state.openMenu} width={280} pageWrapId={"page-wrap"} outerContainerId={"outer-container"} >
                                <Header as="h2" icon inverted>
                                    <Icon name="eye" />
                                    Central Logger™
                                    <Header.Subheader>Menu</Header.Subheader>
                                </Header>
                                <Link to="/" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="eye" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log List</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/manage" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="cogs" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Email</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/summary" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="area graph" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Log Chart</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                                <br />
                                <Link to="/line" className="navbar-item">
                                    <List divided relaxed selection>
                                        <List.Item onClick={this.onOpenMunu}>
                                            <List.Icon name="linechat" size="small" verticalAlign="middle" />
                                            <List.Content>
                                                <List.Header as="a">Line Account</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </Link>
                            </Menu>
                            <main id="page-wrap">
                                <BodyDiv>
                                    <UserList loading={loading} list={userList} onSave={this.onSaveUser}
                                        onDelete={this.OnDeleteUser} />
                                </BodyDiv>
                            </main>
                        </div>
                    )

                }} />
            </Switch>
        )
    }
}