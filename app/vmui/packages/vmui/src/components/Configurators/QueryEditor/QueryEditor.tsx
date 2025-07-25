import { FC, useEffect, useRef, useState, RefObject } from "preact/compat";
import { ErrorTypes } from "../../../types";
import TextField, { TextFieldKeyboardEvent } from "../../Main/TextField/TextField";
import "./style.scss";
import { QueryStats } from "../../../api/types";
import { AutocompleteOptions } from "../../Main/Autocomplete/Autocomplete";
import useDeviceDetect from "../../../hooks/useDeviceDetect";
import { useQueryState } from "../../../state/query/QueryStateContext";
import debounce from "lodash.debounce";

export interface QueryEditorAutocompleteProps {
  value: string;
  anchorEl: RefObject<HTMLInputElement>;
  caretPosition: [number, number]; // [start, end]
  hasHelperText: boolean;
  includeFunctions: boolean;
  isOpen: boolean;
  onSelect: (val: string, caretPosition: number) => void;
  onFoundOptions: (val: AutocompleteOptions[]) => void;
}

export interface QueryEditorProps {
  onChange: (query: string) => void;
  onEnter: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  value: string;
  oneLiner?: boolean;
  autocomplete: boolean;
  autocompleteEl?: FC<QueryEditorAutocompleteProps>;
  error?: ErrorTypes | string;
  stats?: QueryStats;
  label: string;
  disabled?: boolean
  includeFunctions?: boolean;
}

const QueryEditor: FC<QueryEditorProps> = ({
  value,
  onChange,
  onEnter,
  onArrowUp,
  onArrowDown,
  autocomplete,
  autocompleteEl: AutocompleteEl,
  error,
  stats,
  label,
  disabled = false,
  includeFunctions = true
}) => {
  const { autocompleteQuick } = useQueryState();
  const { isMobile } = useDeviceDetect();

  const [openAutocomplete, setOpenAutocomplete] = useState(false);
  const [caretPositionAutocomplete, setCaretPositionAutocomplete] = useState<[number, number]>([0, 0]);
  const [caretPositionInput, setCaretPositionInput] = useState<[number, number]>([0, 0]);
  const autocompleteAnchorEl = useRef<HTMLInputElement>(null);

  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const debouncedSetShowAutocomplete = useRef(debounce(setShowAutocomplete, 500)).current;

  if (stats) {
    label = `${label} (${stats.executionTimeMsec || 0}ms)`;
  }

  const handleSelect = (val: string, caretPosition: number) => {
    onChange(val);
    setCaretPositionInput([caretPosition, caretPosition]);
  };

  const handleKeyDown = (e: TextFieldKeyboardEvent) => {
    const { key, ctrlKey, metaKey, shiftKey } = e;

    const value = (e.target as HTMLTextAreaElement).value || "";
    const isMultiline = value.split("\n").length > 1;

    const ctrlMetaKey = ctrlKey || metaKey;
    const arrowUp = key === "ArrowUp";
    const arrowDown = key === "ArrowDown";
    const enter = key === "Enter";

    // prev value from history
    if (arrowUp && ctrlMetaKey) {
      e.preventDefault();
      onArrowUp();
    }

    // next value from history
    if (arrowDown && ctrlMetaKey) {
      e.preventDefault();
      onArrowDown();
    }

    if (enter && openAutocomplete) {
      e.preventDefault();
    }

    // execute query
    if (enter && !shiftKey && (!isMultiline || ctrlMetaKey) && !openAutocomplete) {
      e.preventDefault();
      onEnter();
    }
  };

  const handleChangeFoundOptions = (val: AutocompleteOptions[]) => {
    setOpenAutocomplete(!!val.length);
  };

  const handleChangeCaret = (val: [number, number]) => {
    setCaretPositionAutocomplete(prev => prev[0] === val[0] && prev[1] === val[1] ? prev : val);
  };

  useEffect(() => {
    setOpenAutocomplete(!!AutocompleteEl && autocompleteQuick);
  }, [autocompleteQuick]);

  useEffect(() => {
    setShowAutocomplete(false);
    debouncedSetShowAutocomplete(caretPositionAutocomplete.every(Boolean));
  }, [caretPositionAutocomplete]);

  return (
    <div
      className="vm-query-editor"
      ref={autocompleteAnchorEl}
    >
      <TextField
        value={value}
        label={label}
        type={"textarea"}
        autofocus={!isMobile}
        error={error}
        onKeyDown={handleKeyDown}
        onChange={onChange}
        onChangeCaret={handleChangeCaret}
        disabled={disabled}
        inputmode={"search"}
        caretPosition={caretPositionInput}
      />
      {autocomplete && AutocompleteEl && (
        <AutocompleteEl
          value={value}
          anchorEl={autocompleteAnchorEl}
          caretPosition={caretPositionAutocomplete}
          hasHelperText={Boolean(error)}
          includeFunctions={includeFunctions}
          onSelect={handleSelect}
          onFoundOptions={handleChangeFoundOptions}
          isOpen={showAutocomplete}
        />
      )}
    </div>
  );
};

export default QueryEditor;
