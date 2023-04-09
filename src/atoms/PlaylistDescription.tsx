import React from 'react';
import parse from 'html-react-parser';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { History } from 'history';

import { goToPlaylist } from '../slices/itemsSlice';

interface ParsedDescriptionProps {
  description: string;
}

const PlaylistDescription: React.FC<ParsedDescriptionProps> = ({ description }) => {
  const dispatch = useDispatch();
  const history: History = useHistory();

  const getParsedDescription = () => {
    const parsedDescription = description.replaceAll(
      /href="spotify:playlist:(\w+)"/g,
      'href="$1" id="replace"'
    );

    const replacedDescription = parse(parsedDescription, {
      replace: (domNode: any) => {
        if (domNode.name === 'a' && domNode.attribs.id === 'replace') {
          return (
            <span
              onClick={() => {
                dispatch(goToPlaylist(history, domNode.attribs.href));
              }}
            >
              {[...domNode.children][0].data}
            </span>
          );
        } else if (domNode.name === 'a') {
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
