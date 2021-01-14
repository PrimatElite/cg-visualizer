import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import schema from '../../Config/schema.json';
import { processElements } from "../../Utils/preprocessing";
import Ajv from 'ajv';

const MenuWrapper = styled.div`
  border: 2px solid black;
  margin: 10px 10px 5px 10px;
  height: 25%;
  display: block;
  position: relative;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

const Menu = ({ handleData }) => {
    const handleClick = () => {
        document.getElementById(`load_file`).click();
    }

    const handleSubmit = e => {
        e.preventDefault();
        if (e.target.files.length) {
            loadJson(e.target.files[e.target.files.length - 1]);
        }
    }

    const loadJson = file => {
        const reader = new FileReader();
        const ajv = new Ajv();
        const validate = ajv.compile(schema);

        reader.addEventListener('load', function() {
            const jsonData = JSON.parse(reader.result);
            const valid = validate(jsonData)
            if (valid) {
                console.log('File is valid!');
                handleData(processElements(jsonData));
            } else {
                console.log('uploaded file rejected by json schema');
            }
        });
        reader.readAsText(file);

    };

    return (
        <MenuWrapper>
            <ButtonWrapper>
                <input
                    id="load_file"
                    name="file"
                    accept=".json"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleSubmit}
                />
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClick}
                >
                    Загрузить файл
                </button>
            </ButtonWrapper>
        </MenuWrapper>
    );
};

Menu.propTypes = {
    handleData: PropTypes.func.isRequired,
}

export default Menu;
