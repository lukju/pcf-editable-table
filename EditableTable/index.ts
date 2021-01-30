import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { IJsonDataTable3Props } from './IJsonDataTable3Props';
import { JsonDataTable3Component } from './JsonDataTable3';

export class JsonDataTable3 implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private notifyOutputChanged: () => void;
	private theContainer: HTMLDivElement;
	private props: IJsonDataTable3Props;

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		console.log("init Editable Tablecomponent", context);
		this.notifyOutputChanged = notifyOutputChanged;
		this.initProps(context);
		this.theContainer = container;
		this.theContainer.classList.add(`mode-${this.props.mode}`)
		if (context.parameters.className.raw) {
			this.theContainer.classList.add(context.parameters.className.raw);
		}
		if (context.parameters.css.raw) {
			const style = document.createElement('style');
			style.innerText = context.parameters.css.raw;
			style.classList.add(`custom-stylings-${context.parameters.className.raw}`);
			document.head.appendChild(style);
		}
	}

	private initProps(context: ComponentFramework.Context<IInputs>) {
		this.props = {
			onDataChanged: this.onTableDataChanged.bind(this),
			titles: loadTitles(context),
			data: context.parameters.data.raw || '[]',
			mode: context.parameters.mode.raw === 'edit' ? 'edit' : 'view'
		}
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		console.log("update view of Editable Tablecomponent", context);
		
		this.initProps(context);

		console.log("Props for React Component", this.props);
		// Render the React component into the div container
		ReactDOM.render(
			// Create the React component
			React.createElement(
				JsonDataTable3Component, // the class type of the React component found in Facepile.tsx
				this.props
			),
			this.theContainer
		);
	}

	/**
   * Called by the React component when it detects a change
   */
	private onTableDataChanged(tableData: string) {
		// only update if the number of faces has truly changed
		if (this.props.data !== tableData) {
			this.props.data = tableData;
			this.notifyOutputChanged();
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			data: this.props.data
		}
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		ReactDOM.unmountComponentAtNode(this.theContainer);
	}
}

const loadTitles = (context: ComponentFramework.Context<IInputs>): string[] => {
	let titles: string[] = [];
	try {
		let titleStr = context.parameters.titles.raw || '[]';
		titleStr = titleStr.replace(/'/g, '"');
		titles = JSON.parse(titleStr) as string[];
	} catch (e) {
		console.error(`couldn't load titles. provided value was: ${context.parameters.titles.raw}`)
	}
	return titles;
}