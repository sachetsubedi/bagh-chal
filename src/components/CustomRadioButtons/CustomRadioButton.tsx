import { Icon } from "@iconify/react";
import { Dispatch, FC, SetStateAction } from "react";
const CustomRadioButton: FC<{
  buttons: { label: string; icon: string; value: "tiger" | "goat" }[];
  setValue: Dispatch<SetStateAction<any>>;
}> = ({ buttons, setValue }) => {
  return (
    <div>
      <div className="flex">
        {buttons.map((button, index) => {
          return (
            <div className="flex items-center relative flex-1" key={index}>
              <input
                type="radio"
                id={button.value}
                className="mr-2  appearance-none  outline outline-slate-200 checked:outline-3 checked:outline-purple-700  cursor-pointer w-full rounded-md p-2 py-10 px-20"
                name="customRadioButton"
                value={button.value}
                onChange={(e) => setValue(e.target.value)}
              />
              <label
                className=" absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex flex-col items-center cursor-pointer text-black"
                htmlFor={button.value}
              >
                <Icon fontSize={"50"} icon={button.icon}></Icon>
                {button.label}
              </label>
            </div>
          );
        })}
        {}
      </div>
    </div>
  );
};

export default CustomRadioButton;
