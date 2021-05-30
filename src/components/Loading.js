import React from 'react';
import styled from 'styled-components';
import LinearProgress from '@material-ui/core/LinearProgress';

const LoadingDiv = styled.div`
  width: 100%;
  margin: 3rem 0 2rem 0;
`


const Loading = () => {
    return (
        <LoadingDiv>
            <LinearProgress/>
        </LoadingDiv>
    )
};

export default Loading;
