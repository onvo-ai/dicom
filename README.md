# Dicom to CSV

This is a simple script to convert DICOM files to CSV files.

## Development

This script needs deno to run. You can install deno by heading to this link: https://docs.deno.com/runtime/getting_started/installation/
You can then install all the dependencies by running the following command:

```bash
deno install
```

You can then run the script by running the following command:

```bash
deno task dev
```

## Example usage

On mac and linux:

```bash
./build/dicom /path/to/dicom/files /path/to/csv/file
./build/dicom /path/to/dicom.zip /path/to/csv/file
```

On windows:

```bash
.\build\dicom.exe /path/to/dicom/files /path/to/csv/file
.\build\dicom.exe /path/to/dicom.zip /path/to/csv/file
```
