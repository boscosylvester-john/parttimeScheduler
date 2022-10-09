import React, {useState} from 'react';
import {Button, Container} from 'react-bootstrap';
import type {LoginProps, MenuProps, UserDetailsObject} from '../../interface';
import {verifyUserLogin} from '../../utils';
import MainPage from '../mainPage/MainPage';
// Import loginCss from './Login.module.css';
import {Navbar, Nav, NavDropdown} from 'react-bootstrap';
import {pageNames} from '../../constants';

const NavigationBar: React.FC<MenuProps> = (props: MenuProps): JSX.Element => {
	const sample = 1;
	return (
		<Navbar bg='light' expand='lg' style={{width: '100%'}}>
			<Container>
				{/* <Navbar.Brand href='#home'>React-Bootstrap</Navbar.Brand> */}
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='me-auto'>
						<Nav.Link onClick={() => {
							props.setActivePage(pageNames.home);
						}}>{pageNames.home}</Nav.Link>
						<Nav.Link onClick={() => {
							props.setActivePage(pageNames.mySchedule);
						}}>{pageNames.mySchedule}</Nav.Link>
						<Nav.Link onClick={() => {
							props.setActivePage(pageNames.workPlace);
						}}>{pageNames.workPlace}</Nav.Link>
						<Nav.Link onClick={() => {
							props.setActivePage(pageNames.tradePlace);
						}}>{pageNames.tradePlace}</Nav.Link>
						<NavDropdown title='Profile' id='basic-nav-dropdown'>
							<NavDropdown.Item>{props.userData.username}</NavDropdown.Item>
							<NavDropdown.Item>{props.userData.userRole}</NavDropdown.Item>
							<NavDropdown.Divider />
							<NavDropdown.Item onClick={() => {
								props.setIsUserLoggedIn(false);
							}}>
                Logout
							</NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default NavigationBar;
