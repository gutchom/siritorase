import {
	createContext,
	useContext,
	useReducer,
	type Dispatch,
	type ReactNode,
} from 'react';

export const colors = [
	'white',
	'lightgray',
	'red',
	'pink',
	'yellow',
	'lightgreen',
	'cyan',
	'black',
	'gray',
	'brown',
	'purple',
	'orange',
	'green',
	'blue',
] as const;

export type StrokeColor = (typeof colors)[number];

export const widths = [8, 24, 64] as const;

export type StrokeWidth = (typeof widths)[number];

export type StrokeType = 'pen' | 'eraser';

export type Stroke = {
	color: StrokeColor;
	width: StrokeWidth;
	type: StrokeType;
	points: { x: number; y: number }[];
};

type DrawingState = {
	color: StrokeColor;
	width: StrokeWidth;
	type: StrokeType;
	strokes: Stroke[];
	canceledStrokes: Stroke[];
};

type DrawingAction =
	| { type: 'SET_COLOR'; color: StrokeColor }
	| { type: 'SET_WIDTH'; width: StrokeWidth }
	| { type: 'SET_TYPE'; strokeType: StrokeType }
	| { type: 'PUSH_STROKE'; stroke: Stroke }
	| { type: 'UNDO' }
	| { type: 'REDO' };

const initialState: DrawingState = {
	color: 'black',
	width: 24,
	type: 'pen',
	strokes: [],
	canceledStrokes: [],
};

function reducer(state: DrawingState, action: DrawingAction): DrawingState {
	switch (action.type) {
		case 'SET_COLOR':
			return { ...state, color: action.color };
		case 'SET_WIDTH':
			return { ...state, width: action.width };
		case 'SET_TYPE':
			return { ...state, type: action.strokeType };
		case 'PUSH_STROKE':
			return {
				...state,
				strokes: [...state.strokes, action.stroke],
				canceledStrokes: [],
			};
		case 'UNDO':
			return state.strokes.length === 0
				? state
				: {
						...state,
						strokes: state.strokes.slice(0, -1),
						canceledStrokes: [
							...state.canceledStrokes,
							...state.strokes.slice(-1),
						],
					};
		case 'REDO':
			return state.canceledStrokes.length === 0
				? state
				: {
						...state,
						strokes: [...state.strokes, ...state.canceledStrokes.slice(-1)],
						canceledStrokes: state.canceledStrokes.slice(0, -1),
					};
	}
}

const DrawingContext = createContext<{
	state: DrawingState;
	dispatch: Dispatch<DrawingAction>;
} | null>(null);

export function DrawingProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	return (
		<DrawingContext.Provider value={{ state, dispatch }}>
			{children}
		</DrawingContext.Provider>
	);
}

export function useDrawingContext(): {
	state: DrawingState;
	dispatch: Dispatch<DrawingAction>;
} {
	const context = useContext(DrawingContext);
	if (!context) {
		throw new Error('useDrawingContext must be used within a DrawingProvider');
	}
	return context;
}
