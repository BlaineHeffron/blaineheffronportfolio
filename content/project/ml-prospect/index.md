---
title: Machine Learning for Event Reconstruction in the PROSPECT detector
summary: An exploration of machine learning techniques used to reconstruct event energy, position, and particle classification in the face of missing detectors in the PROSPECT experiment.
tags:
  - Deep Learning
date: "2022-12-01T00:00:00Z"

external_link: ""

image:
  caption: Illustration of the ML-based classifier performance for different particle types on the left, improvement in signal selection and background rejection on the right.
  focal_point: Center

url_code: "https://github.com/BlaineHeffron/WaveformML"
url_pdf: ""
url_slides: "/uploads/PROSPECT_SE_ML_Summary.pdf"
url_video: ""
---

The Precision Reactor Oscillation and Spectrum Experiment (PROSPECT), was a segmented antineutrino detector. In 2018, it measured the antineutrino spectrum at the High Flux Isotope Reactor (HFIR) in Oak Ridge, TN. Over the course of the experiment, several detector glitches rendered many segments with only a single photomultiplier tube operational.

To overcome this hurdle, we turned to various machine learning methods to carry out the task of event energy and particle classifications reconstruction. This project brings focus primarily on convolutional neural networks (CNNs) and graph convolutional networks (GCNs). Leveraging these techniques led to a marked improvement — an increase in effective statistics of the dataset by 3.3% over traditional analysis techniques.

The successful application of machine learning methods can be highly beneficial in similar scenarios faced with other segmented particle detectors. The results showed that even when working with incomplete data due to hardware failures, through machine learning, one can still extract valuable insights.

In a broader context, this project underscores the central role advanced machine learning algorithms will play in future scientific experiments. By succinctly handling data inefficiencies, we can push the boundaries of experimental limitations and drive innovation forward.
