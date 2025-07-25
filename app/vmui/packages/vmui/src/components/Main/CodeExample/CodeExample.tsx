import { FC, useEffect, useState } from "preact/compat";
import "./style.scss";
import Tooltip from "../Tooltip/Tooltip";
import Button from "../Button/Button";
import { CopyIcon } from "../Icons";
import useCopyToClipboard from "../../../hooks/useCopyToClipboard";

enum CopyState { copy = "Copy", copied = "Copied" }

const CodeExample: FC<{code: string}> = ({ code }) => {
  const copyToClipboard = useCopyToClipboard();

  const [tooltip, setTooltip] = useState(CopyState.copy);
  const handlerCopy = async () => {
    await copyToClipboard(code);
    setTooltip(CopyState.copied);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (tooltip === CopyState.copied) {
      timeout = setTimeout(() => setTooltip(CopyState.copy), 1000);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [tooltip]);

  return (
    <code className="vm-code-example">
      {code}
      <div className="vm-code-example__copy">
        <Tooltip title={tooltip}>
          <Button
            size="small"
            variant="text"
            onClick={handlerCopy}
            startIcon={<CopyIcon/>}
            ariaLabel="close"
          />
        </Tooltip>
      </div>
    </code>
  );
};

export default CodeExample;
