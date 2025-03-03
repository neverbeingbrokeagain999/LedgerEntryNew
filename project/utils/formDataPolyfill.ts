// FormData polyfill for web environment
export class FormDataPolyfill {
  private data: Array<[string, string | Blob]> = [];

  append(name: string, value: string | Blob): void {
    this.data.push([name, value]);
  }

  delete(name: string): void {
    this.data = this.data.filter(([key]) => key !== name);
  }

  get(name: string): FormDataEntryValue | null {
    const entry = this.data.find(([key]) => key === name);
    return entry ? entry[1] : null;
  }

  getAll(name: string): FormDataEntryValue[] {
    return this.data
      .filter(([key]) => key === name)
      .map(([, value]) => value);
  }

  has(name: string): boolean {
    return this.data.some(([key]) => key === name);
  }

  set(name: string, value: string | Blob): void {
    const index = this.data.findIndex(([key]) => key === name);
    if (index !== -1) {
      this.data[index] = [name, value];
    } else {
      this.data.push([name, value]);
    }
  }

  entries(): IterableIterator<[string, FormDataEntryValue]> {
    return this.data[Symbol.iterator]();
  }

  keys(): IterableIterator<string> {
    return this.data.map(([key]) => key)[Symbol.iterator]();
  }

  values(): IterableIterator<FormDataEntryValue> {
    return this.data.map(([, value]) => value)[Symbol.iterator]();
  }

  forEach(callback: (value: FormDataEntryValue, key: string, parent: FormData) => void): void {
    this.data.forEach(([key, value]) => callback(value, key, this as unknown as FormData));
  }
}

if (typeof window !== 'undefined' && !window.FormData) {
  (window as any).FormData = FormDataPolyfill;
}

export default FormDataPolyfill;