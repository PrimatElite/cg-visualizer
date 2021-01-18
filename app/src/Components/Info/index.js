import React from 'react';
import styled from 'styled-components';
import {getByRef} from "../../Utils/schema";
import {createAccordionItem, createAccordion} from "../../Utils/generators";

const InfoWrapper = styled.div`
  border: 2px solid black;
  margin: 5px 10px 10px 10px;
  height: 75%;
  overflow: auto;
  padding: 10px;
`;


function drawInfo(data) {
    const id = 'infoBlock';
    const children = data.visualizations.map(item =>
        info(id, data, getByRef(data, item.$ref), item.$ref.split('/')[2])
    );
    return createAccordion(id, children);
}

function info(parent, data, item, id) {
    if (item instanceof Array) {
        const newId = `${id}_array`;
        const body = createAccordion(newId, item.map((el, ind) => info(newId, data, el, `${id}_${ind}`)));
        return createAccordionItem(parent, id, body, id);
    } else {
        return item.info(parent, id);
    }
}

const Info = ({ data }) => (
    <InfoWrapper>
        {drawInfo(data)}
    </InfoWrapper>
);

export default Info;
