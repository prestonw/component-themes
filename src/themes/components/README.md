# Theme Components

This directory is for Theme Components, not just regular old React components.

Each theme component is a React Component which will be available to be used in a theme's page layout. The component should follow a few guidelines:

1. It should be as simple as possible. These components will need to be tranformed into PHP code so their logic has to be very basic. A stateless functional component is recommended.
2. It should render its top-level element with `className` set to the prop `className`.
3. It should include a description. You can export a `description` property on the Component object (eg: `TextWidget.description = 'This is a box for text';`).
4. All its data should come from props. There ideally should be no calls to outside libraries, unless it's just for processing data.
5. It should include meta-data about its editable props. Rather than, or in addition to, using React's `propTypes`, you can export an `editableProps` property on the Component object which contains meta-data about each prop. The meta-data should be an object that has two properties of its own: `type` (a string describing the property type, like `'boolean'` or `'string'` or `'array'`), and `label` (a string description for that property).
6. It must be registered in JS by calling `ComponentThemes.registerComponent()` before the theme is rendered.
7. It must be registered in PHP by including the component file before the theme is rendered and calling `Component_Themes::register_component()`.

Here's an example component:

```js
const ComponentThemes = window.ComponentThemes;
const { React, registerComponent } = ComponentThemes;

const TextWidget = ( { text, className } ) => {
	return (
		<div className={ className }>
			{ text || 'This is a text widget with no data!' }
		</div>
	);
};

TextWidget.description = 'A block of text or html.';
TextWidget.editableProps = {
	text: {
		type: 'string',
		label: 'The text to display.'
	}
};

registerComponent( 'TextWidget', TextWidget );
```

The PHP version of the component can be slightly simpler because it does not require the description and editableProps properties, but it can use `React::createElement()` which is what the JSX in the React component will be transpiled into.

```php
<?php
function Component_Themes_TextWidget( $props ) {
	$text = ct_get_value( $props, 'text', 'This is a text widget with no data!' );
	$class_name = ct_get_value( $props, 'className', '' );
	return React::createElement( 'div', [ 'className' => $class_name ], $text );
}

Component_Themes::register_component( 'TextWidget', 'Component_Themes_TextWidget' );
```

## Required API data

Many components will require WordPress data from the server. To specify that a component requires this data, you can add two pieces of data to the component:

1. The list of REST API endpoints needed for the data to be available.
2. A function to translate the REST API responses into props for the component.

These pieces of data are specified differently in React and PHP as shown below.

In JavaScript we use a Higher Order Component function called 'apiDataWrapper'. The function accepts two arguments: an array of endpoints required, and a function to map the api data (the same pieces of data as noted above).

```js
const ComponentThemes = window.ComponentThemes;
const { React, registerComponent, apiDataWrapper } = ComponentThemes;

const HeaderText = ( { siteTitle, siteTagline, className } ) => {
	return (
		<div className={ className }>
			<h1 className="HeaderText__title">{ siteTitle || 'My Website' }</h1>
			<div className="HeaderText__tagline">{ siteTagline || 'My home on the web' }</div>
		</div>
	);
};

HeaderText.description = 'Header containing site title and tagline.';
HeaderText.editableProps = {
	siteTitle: {
		type: 'string',
		label: 'The site title'
	},
	siteTagline: {
		type: 'string',
		label: 'The site sub-title or tagline'
	}
};

const mapApiToProps = ( api ) => {
	const siteInfo = api[ '/' ];
	return {
		siteTitle: siteInfo && siteInfo.name,
		siteTagline: siteInfo && siteInfo.description,
	};
};

registerComponent( 'HeaderText', apiDataWrapper( [ '/' ], mapApiToProps )( HeaderText ) );
```

In PHP we must use a different technique. The component class should have the static property `$required_api_endpoints` which is an array of API endpoints. It must then also have a static function `map_api_to_props` which translates the API data into the props required by the component.

*NB: `ct_get_value()` is a helper function that just returns a property in an array if it exists, otherwise it returns a default value.*

```php
<?php
class Component_Themes_HeaderText extends Component_Themes_Component {
	public function render() {
		$site_title = ct_get_value( $this->props, 'siteTitle', 'My Website' );
		$site_tagline = ct_get_value( $this->props, 'siteTagline', 'My home on the web' );
		$class_name = ct_get_value( $this->props, 'className', '' );
		return "<div class='$class_name'>
      <h1 class='HeaderText__title'>$site_title</h1>
      <div class='HeaderText__tagline'>$site_tagline</div>
</div>";
	}

	public static $required_api_endpoints = [ '/' ];

	public static function map_api_to_props( $api ) {
		$site_info = ct_get_value( $api, '/' );
		return [
			'siteTitle' => ct_get_value( $site_info, 'name' ),
			'siteTagline' => ct_get_value( $site_info, 'description' ),
		];
	}
}

Component_Themes::register_component( 'HeaderText', 'Component_Themes_HeaderText' );
```

## Component Styles

Some components need default styles applied that are independent of the theme. These can be applied in the component definition.

In JavaScript we use the `styled()` Higher-Order-Component function. Note that in the JS version we **must** skip a className for the top-level tag, as it will be added automatically. See the documentation for [Styled Components](https://github.com/styled-components/styled-components) for more information.

```js
const ComponentThemes = window.ComponentThemes;
const { React, registerComponent, styled } = ComponentThemes;

const RowComponent = ( { children, className } ) => {
	return (
		<div className={ className }>
			{ children }
		</div>
	);
};

const Styled = styled( RowComponent )`
	display: flex;
	justify-content: space-between;
`;

registerComponent( 'RowComponent', Styled );
```

In PHP we use `Component_Themes::style_component()`. Note that in the PHP version, we **must** specify classNames explicity. Bare style rules will not be automatically wrapped in a selector as they are in JavaScript.

```php
<?php
$row_component = function( $props, $children ) {
	$class_name = ct_get_value( $props, 'className', '' );
	return React::createElement( 'div', [ 'className' => $class_name ], $children );
};

$styled = Component_Themes::style_component( $row_component, '
.RowComponent {
	display: flex;
	justify-content: space-between;
}' );

Component_Themes::register_component( 'RowComponent', $styled );
```

For more information about how Theme Components are used see the [Theme documentation](../themes/README.md).
