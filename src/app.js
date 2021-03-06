/* globals window */

/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { ComponentThemePage } from '~/src/';
import { apiDataWrapper } from '~/src/lib/api';
import { registerComponent, registerPartial } from '~/src/lib/components';
import { makeComponentWith, getPropsFromParent } from '~/src/lib/component-builder';
import defaultTheme from '~/src/themes/default.json';

const ComponentThemes = {
	renderPage: function( theme, slug, page, target ) {
		const App = <ComponentThemePage theme={ theme } defaultTheme={ defaultTheme } page={ page } slug={ slug } />;
		ReactDOM.render( App, target );
	},

	React,
	styled,
	registerComponent,
	registerPartial,
	apiDataWrapper,
	makeComponentWith,
	getPropsFromParent,
};

if ( typeof window !== 'undefined' ) {
	window.ComponentThemes = ComponentThemes;
}

export default ComponentThemes;
