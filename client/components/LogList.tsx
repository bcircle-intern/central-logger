import React from "react"
import { Segment, Table, Icon, Header, Dropdown, Loader, Button } from "semantic-ui-react"
import { Logs } from "./Log"
import DatePicker from "react-datepicker"
import { Moment } from "moment"
import { Log } from "../share/LoggerApi"
import "/css/Body.css"
import InfiniteScroll from "react-infinite-scroll-component";

type Props = {
    endDay: Moment
    startDay: Moment
    loading: boolean
    logNow: Log[]
    all: string
    onStartChange: (Moment) => void
    onEndChange: (Moment) => void
    allApp: any[]
    allIp: any[]
    onIpChange: (options) => void
    onAppChange: (options) => void
    selectApp: string
    selectIp: string
    allData: Log[]
    onMore: () => void
    logLenght: number
    new: boolean
}
type State = {
    items: Log[]
    hasMore: boolean
}

export class LogList extends React.Component<Props, State> {
    private limit: number;
    private log: Log[]
    constructor(props) {
        super(props)
        this.state = {
            items: this.props.allData,
            hasMore: true,
        }
        this.limit = 0;
    }
    public fetchMoreData = () => {
        if (this.props.logLenght === this.state.items.length) {
            this.setState({ hasMore: false });
            return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        this.props.onMore()
        setTimeout(() => {
            this.setState({
                items: this.state.items.concat(this.props.allData)
            });
        }, 500);
    };
    public setStart = (data) => {
        this.props.onStartChange(data)
    }
    public setEnd = (data) => {
        this.props.onEndChange(data)
    }
    public setIp = (_, { value }) => {
        this.props.onIpChange(value)
    }
    public setApp = (_, { value }) => {
        this.props.onAppChange(value)
    }
    public componentDidUpdate(prevProps, prevState) {
        if (prevProps.allData !== this.props.allData) {
            this.setState({ items: [], hasMore: true })
            // let items = this.props.allData
            // items = [...items, ...this.props.logNow]
            // this.setState({ items });
            if (!this.props.new) {
                this.setState({
                    items: this.state.items.concat(this.props.allData)
                });
            } else {
                this.setState({ items: this.props.allData })
            }
        }
    }
    public render() {
        let style = {
            marginLeft: "10px",
            marginRight: "10px"
        }

        return (
            <Segment.Group>
                <Segment textAlign="center" inverted color="blue">
                    <Icon style={style} size="large" name="address book outline" />
                    <Dropdown placeholder="All IP" closeOnChange selection options={this.props.allIp} onChange={this.setIp} value={this.props.selectIp} />
                    <Icon style={style} size="large" name="box" />
                    <Dropdown className="dropdown" disabled={this.props.selectIp === ""} placeholder="All Application" closeOnChange selection options={this.props.allApp} onChange={this.setApp} value={this.props.selectApp} />
                    <Icon style={style} size="large" name="calendar alternate outline" />
                    <div className="ui input datepicker">
                        <DatePicker
                            dateFormat="DD/MM/YY HH:mm"
                            selected={this.props.startDay}
                            onChange={this.setStart}
                            isClearable={false}
                            placeholderText="Select Date"
                            className="inputdate"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time" />
                        <span style={style} />
                        <DatePicker
                            dateFormat="DD/MM/YY HH:mm"
                            selected={this.props.endDay}
                            onChange={this.setEnd}
                            isClearable={false}
                            placeholderText="Select Date"
                            className="inputdate"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            minDate={this.props.startDay}
                        />
                    </div>
                </Segment>
                <Segment textAlign="right" style={{ minHeight: "calc( 100vh - 230px )" }}>
                    <div className="loglist" style={{ width: "100%" }}>
                        {this.props.logLenght === 0 && !this.props.loading ?
                            <Header as="h1" icon>
                                <br />
                                <Icon size="huge" name="frown outline" />
                                <br />ไม่มีบันทึก Log ในช่วงเวลา
                             <Header.Subheader><br />{this.props.all}</Header.Subheader>
                            </Header>
                            :
                            <InfiniteScroll
                                dataLength={this.state.items.length}
                                next={this.fetchMoreData}
                                hasMore={this.state.hasMore}
                                loader={<Loader active inline="centered" />}
                                height="100%"
                                endMessage={
                                    <p style={{ textAlign: "center" }}>
                                        <b>You have seen it all</b>
                                    </p>
                                }
                            >
                                <Table compact >
                                    <Table.Body>
                                        {
                                            this.state.items.map((x, key) => <Logs logsNow={x} key={key} />)
                                        }
                                    </Table.Body>
                                </Table>

                            </InfiniteScroll>
                        }
                    </div>
                </Segment>
            </Segment.Group>
        )
    }
}