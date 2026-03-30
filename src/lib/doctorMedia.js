import aishaPortrait from "../assets/generated/doctors/dr-aisha-rahman.png";
import karanPortrait from "../assets/generated/doctors/dr-karan-sood.png";
import meeraPortrait from "../assets/generated/doctors/dr-meera-joseph.png";
import rohanPortrait from "../assets/generated/doctors/dr-rohan-iyer.png";
import sanaPortrait from "../assets/generated/doctors/dr-sana-qureshi.png";
import devPortrait from "../assets/generated/doctors/dr-dev-malhotra.png";
import priyaPortrait from "../assets/generated/doctors/dr-priya-nair.png";
import harshPortrait from "../assets/generated/doctors/dr-harsh-bedi.png";
import farahPortrait from "../assets/generated/doctors/dr-farah-siddiqui.png";
import nandiniPortrait from "../assets/generated/doctors/dr-nandini-rao.png";
import vikramPortrait from "../assets/generated/doctors/dr-vikram-khanna.png";
import ishaPortrait from "../assets/generated/doctors/dr-isha-kapoor.png";
import kabirPortrait from "../assets/generated/doctors/dr-kabir-ali.png";

export const doctorPhotoById = new Map([
  ["dr-aisha-rahman", aishaPortrait],
  ["dr-karan-sood", karanPortrait],
  ["dr-meera-joseph", meeraPortrait],
  ["dr-rohan-iyer", rohanPortrait],
  ["dr-sana-qureshi", sanaPortrait],
  ["dr-dev-malhotra", devPortrait],
  ["dr-priya-nair", priyaPortrait],
  ["dr-harsh-bedi", harshPortrait],
  ["dr-farah-siddiqui", farahPortrait],
  ["dr-nandini-rao", nandiniPortrait],
  ["dr-vikram-khanna", vikramPortrait],
  ["dr-isha-kapoor", ishaPortrait],
  ["dr-kabir-ali", kabirPortrait],
]);

export function getDoctorPhoto(doctorId) {
  return doctorPhotoById.get(doctorId) || "";
}

export function attachDoctorPhotos(doctors) {
  return doctors.map((doctor) => ({
    ...doctor,
    photo: getDoctorPhoto(doctor.id),
  }));
}
