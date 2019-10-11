import React from "react"
import { Log, LogLevel, GetEmail, GetUsers } from "../share/LoggerApi";
import { Table, Icon, Form, Modal, Button, SemanticICONS, Input } from "semantic-ui-react"
import "moment/locale/th"
import "/css/Body.css"
import Switch from "react-switch";
import swal from "sweetalert2"

type Props = {
    list: string
    // tslint:disable-next-line:variable-name
    onDelete: (string) => void
}
type State = {
}

export class User extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    public componentDidMount() {
    }
    private onDelete = () => {
        this.props.onDelete(this.props.list)
    }
    public render() {
        return (
            this.props.list !== undefined ?
                <Table.Row>
                    <Table.Cell  >{this.props.list}</Table.Cell>
                    <Table.Cell textAlign="center">
                        <div>
                            <Button inverted color="red" content="ลบผู้ใช้" icon="trash alternate" labelPosition="left" onClick={this.onDelete} />
                        </div>
                    </Table.Cell>
                </Table.Row>
                :
                <div>ไม่พบข้อมูล</div>
        )
    }
}