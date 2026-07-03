import { useState } from "react";

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  function handleChange(event) {
    const { name, value, type } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "number" ? Number(value) : value
    }));
  }

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function reset(nextValues = initialValues) {
    setValues(nextValues);
  }

  return { values, setValues, handleChange, setField, reset };
}
