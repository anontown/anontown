import { FontIcon, IconButton, List, ListItem } from "material-ui";
import * as React from "react";
import { ng, Storage, UserData, Sto } from "../domains/entities";
import { Modal } from "./modal";
import { NGEditor } from "./ng-editor";

interface NGProps {
  userData: UserData;
  onChangeStorage: (user: Storage) => void;
}

interface NGState {
  dialog: string | null;
}

export class NG extends React.Component<NGProps, NGState> {
  constructor(props: NGProps) {
    super(props);
    this.state = {
      dialog: null,
    };
  }

  render() {
    return (
      <div>
        <IconButton
          onClick={() =>
            this.props.onChangeStorage(
              Sto.addNG(ng.createDefaultNG())(this.props.userData.storage),
            )
          }
        >
          <FontIcon className="material-icons">add_circle</FontIcon>
        </IconButton>
        <List>
          {Sto.getNG(this.props.userData.storage).map(node => (
            <ListItem
              rightIconButton={
                <IconButton
                  onClick={() =>
                    this.props.onChangeStorage(
                      Sto.removeNG(node.id)(this.props.userData.storage),
                    )
                  }
                >
                  <FontIcon className="material-icons">close</FontIcon>
                </IconButton>
              }
              onClick={() => this.setState({ dialog: node.id })}
              key={node.id}
              primaryText={node.name}
            >
              <Modal
                isOpen={this.state.dialog === node.id}
                onRequestClose={() => this.setState({ dialog: null })}
              >
                <h1>{node.name}</h1>
                <NGEditor
                  ng={node}
                  onUpdate={v =>
                    this.props.onChangeStorage(
                      Sto.updateNG(v)(this.props.userData.storage),
                    )
                  }
                />
              </Modal>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}
