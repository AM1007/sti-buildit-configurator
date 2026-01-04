import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const DEFAULT_POSITION = "topRight" as const;
const DEFAULT_TIMEOUT = 3000;

export const toast = {
  success(message: string): void {
    iziToast.success({
      message,
      position: DEFAULT_POSITION,
      timeout: DEFAULT_TIMEOUT,
    });
  },

  error(message: string): void {
    iziToast.error({
      message,
      position: DEFAULT_POSITION,
      timeout: DEFAULT_TIMEOUT,
    });
  },

  info(message: string): void {
    iziToast.info({
      message,
      position: DEFAULT_POSITION,
      timeout: DEFAULT_TIMEOUT,
    });
  },

  copyFallback(text: string): void {
    iziToast.info({
      title: "Copy manually:",
      message: `<input type="text" value="${text}" readonly style="width:100%;padding:4px;margin-top:8px;font-family:monospace;" onclick="this.select()" />`,
      position: DEFAULT_POSITION,
      timeout: false,
      close: true,
    });
  },

  confirm(message: string, onConfirm: () => void): void {
    iziToast.question({
      timeout: false,
      close: false,
      overlay: true,
      displayMode: 2,
      id: "confirm-toast",
      message,
      position: "center",
      buttons: [
        [
          "<button type='button' style='background:#c8102e;color:white;font-weight:bold;'>Confirm</button>",
          (instance, toastEl) => {
            instance.hide({ transitionOut: "fadeOut" }, toastEl, "button");
            onConfirm();
          },
          false,
        ],
        [
          "<button type='button'>Cancel</button>",
          (instance, toastEl) => {
            instance.hide({ transitionOut: "fadeOut" }, toastEl, "button");
          },
          true,
        ],
      ],
    });
  },
};