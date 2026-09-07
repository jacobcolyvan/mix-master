import parse from "html-react-parser";
import React from "react";
import { useHistory } from "react-router-dom";

interface PlaylistDescriptionProps {
  description: string;
}

const PlaylistDescription: React.FC<PlaylistDescriptionProps> = ({ description }) => {
  const history = useHistory();

  const getParsedDescription = () => {
    const parsedDescription = description.replaceAll(
      /href="spotify:playlist:(\w+)"/g,
      'href="$1" id="replace"'
    );

    const replacedDescription = parse(parsedDescription, {
      replace: (domNode: any) => {
        if (domNode.name === "a" && domNode.attribs.id === "replace") {
          return (
            <span
              onClick={() => {
                history.push(`/playlist?id=${encodeURIComponent(domNode.attribs.href)}`);
              }}
            >
              {[...domNode.children][0].data}
            </span>
          );
        } else if (domNode.name === "a") {
          return (
            <a {...domNode.attribs} target="_blank">
              {[...domNode.children][0].data}
            </a>
          );
        }

        return domNode;
      },
    });

    return replacedDescription;
  };

  return <p className="playlist-page-description">{getParsedDescription()}</p>;
};

export default PlaylistDescription;
