import dicom from "npm:dicom-parser";
import { isASCII, mapUid } from "./utils.ts";
import { lookup } from "./dataDictionary.ts";
import { Buffer } from "node:buffer";

export const parseDicom = (dicomFileAsBuffer: Buffer) => {
  let output: any = {};
  var dataSet = dicom.parseDicom(dicomFileAsBuffer);

  Object.keys(dataSet.elements).forEach((propertyName) => {
    let element = dataSet.elements[propertyName];

    let text = "";

    if (element.vr === undefined) {
      var str = dataSet.string(propertyName);
      var stringIsAscii = isASCII(str || "");

      if (stringIsAscii) {
        // the string will be undefined if the element is present but has no data
        // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
        // data.  Note that the length of the element will be 0 to indicate "no data"
        // so we don't put anything here for the value in that case.
        if (str !== undefined) {
          text = str;
        } else {
          if (element.length === 2) {
            text = dataSet.uint16(propertyName) + "";
          } else if (element.length === 4) {
            text = dataSet.uint32(propertyName) + "";
          }
        }
      } else {
        if (element.length !== 2 && element.length !== 4) {
          // If it is some other length and we have no string
          text = "<i>binary data</i>";
        }
      }
    } else {
      let vr = element.vr;
      if (dicom.isStringVr(vr)) {
        // Next we ask the dataset to give us the element's data in string form.  Most elements are
        // strings but some aren't so we do a quick check to make sure it actually has all ascii
        // characters so we know it is reasonable to display it.
        var str = dataSet.string(propertyName);
        var stringIsAscii = isASCII(str || "");

        if (stringIsAscii) {
          // the string will be undefined if the element is present but has no data
          // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
          // data.  Note that the length of the element will be 0 to indicate "no data"
          // so we don't put anything here for the value in that case.
          if (str !== undefined) {
            text += mapUid(str);
          }
        } else {
          if (element.length !== 2 && element.length !== 4) {
            // If it is some other length and we have no string
            text += "<i>binary data</i>";
          }
        }
      } else if (vr === "US") {
        text += dataSet.uint16(propertyName);
        for (var i = 1; i < dataSet.elements[propertyName].length / 2; i++) {
          text += "\\" + dataSet.uint16(propertyName, i);
        }
      } else if (vr === "SS") {
        text += dataSet.int16(propertyName);
        for (var i = 1; i < dataSet.elements[propertyName].length / 2; i++) {
          text += "\\" + dataSet.int16(propertyName, i);
        }
      } else if (vr === "UL") {
        text += dataSet.uint32(propertyName);
        for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
          text += "\\" + dataSet.uint32(propertyName, i);
        }
      } else if (vr === "SL") {
        text += dataSet.int32(propertyName);
        for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
          text += "\\" + dataSet.int32(propertyName, i);
        }
      } else if (vr == "FD") {
        text += dataSet.double(propertyName);
        for (var i = 1; i < dataSet.elements[propertyName].length / 8; i++) {
          text += "\\" + dataSet.double(propertyName, i);
        }
      } else if (vr == "FL") {
        text += dataSet.float(propertyName);
        for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
          text += "\\" + dataSet.float(propertyName, i);
        }
      } else if (vr === "AT") {
        var group = dataSet.uint16(propertyName, 0);
        var element2 = dataSet.uint16(propertyName, 1);
        if (group && element2) {
          var groupHexStr = ("0000" + group.toString(16)).substr(-4);
          var elementHexStr = ("0000" + element2.toString(16)).substr(-4);
          text += "x" + groupHexStr + elementHexStr;
        }
      } else if (
        vr === "OB" ||
        vr === "OW" ||
        vr === "UN" ||
        vr === "OF" ||
        vr === "UT" ||
        vr === "SQ"
      ) {
      } else {
        // If it is some other length and we have no string
        text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
      }
    }

    output[
      lookup(propertyName.substring(1).toUpperCase())?.name || element.tag
    ] = text;
  });
  return output;
};
