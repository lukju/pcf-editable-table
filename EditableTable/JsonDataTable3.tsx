import { MarqueeSelection, DetailsList, DetailsListLayoutMode, IColumn, TextField, SelectionMode, Stack, Label } from "office-ui-fabric-react";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { IJsonDataTable3Props } from "./IJsonDataTable3Props";
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { IconButton } from '@fluentui/react/lib/Button';

initializeIcons(/* optional base url */);

export const JsonDataTable3Component = (props: IJsonDataTable3Props) => {
    const [columns, setColumns] = useState<IColumn[]>();

    const [rows, setRows] = useState<Object[]>([]);

    useEffect(() => {
        const columns = props.titles.map((title, index) => {
            return { key: `column-${index}`, name: title, fieldName: `column-${index}`, className: `column-${index}`, minWidth: 100, maxWidth: 1000, isResizable: true }
        })
        if (props.mode === 'edit') {
            columns.push({
                key: 'remove',
                fieldName: 'remove',
                isResizable: false,
                minWidth: 50,
                maxWidth: 50,
                className: `remove`,
                name: ''
            })
        }
        setColumns(columns);
    }, [props.mode, props.titles])

    useEffect(() => {
        if (columns && columns.length > 0) {
            try {
                console.log("calc new rows")
                const deserializedData = JSON.parse(props.data) as string[][];
                const changedRows: Object[] = [];
                deserializedData.forEach((rowData, rowIndex) => {
                    const row: any = {
                        key: `row-${rowIndex}`
                    };
                    rowData.forEach((colValue, colIndex) => {
                        row[`column-${colIndex}`] = colValue;
                    })
                    changedRows.push(row);
                })
                if (!rows || JSON.stringify(rows) !== JSON.stringify(changedRows)) {
                    console.log("set new rows")
                    setRows(changedRows);
                }
            } catch (e) {
                console.error(`Couldn't load table data. provided value was: ${props.data}`);
            }
        }
    }, [props.data, columns])
    
    useEffect(() => {
        const rowsData: string[][] = [];
        rows.forEach((row: any) => {
            const rowData: string[] = [];
            columns?.forEach(column => {
                rowData.push(row[column.key]);
            })
            rowsData.push(rowData);
        })
        props.onDataChanged(JSON.stringify(rowsData));
    }, [rows])

    const onRenderCell = (item: any, rowIndex?: number, column?: IColumn) => {
        if (!column) return <></>;
        if (column.key === 'remove') {
            return <IconButton iconProps={{ iconName: 'Delete' }} title="Remove" ariaLabel="Remove" onClick={() => {
                const changedRows: any[] = rows.filter((row, index) => {
                    return index !== rowIndex;
                });
                setRows(changedRows);
            }}/>;
        }
        if (props.mode === 'view') {
            return <span>{item[column?.key]}</span>
        }
        if (props.mode === 'edit' && rowIndex !== undefined) {
            const onChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                const changedRows = [...rows];
                const changedRow: any = changedRows[rowIndex];
                changedRow[column.key] = newValue;
                setRows(changedRows);
            }
            return <TextField value={item[column?.key] ||''} onChange={onChange}></TextField>
        }
    }

    return (
        <>
            <DetailsList
                items={rows}
                columns={columns}
                setKey="set"
                selectionMode={SelectionMode.none}
                onRenderItemColumn={onRenderCell}
                layoutMode={DetailsListLayoutMode.justified}
            />
            { props.mode === 'edit' && 
            <Stack>
                <IconButton iconProps={{ iconName: 'Add' }} style={{marginLeft: '5px'}} title="Add" ariaLabel="Add" onClick={() => {
                    const newRow: any = {
                        key: `row-${rows.length}`
                    };
                    columns?.forEach(column => {
                        newRow[column.key] = '';
                    })
                    setRows([...rows, newRow]);
                }}/>
            </Stack> }
        </>
    )
}