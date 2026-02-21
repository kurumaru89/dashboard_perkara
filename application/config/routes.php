<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$route['default_controller'] = 'halamanutama';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

$route['show_eksekusi'] = 'HalamanUtama/show_eksekusi';
$route['show_eksekusi_ht'] = 'HalamanUtama/show_eksekusi_ht';
$route['get_chart_beban_perkara'] = 'HalamanUtama/get_chart_beban_perkara';
$route['get_pie_beban_perkara'] = 'HalamanUtama/get_pie_beban_perkara';

$route['show_jinayat'] = 'HalamanUtama/show_jinayat';
$route['get_chart_jinayat'] = 'HalamanUtama/get_chart_jinayat';
$route['show_jinayat_kasasi'] = 'HalamanUtama/show_jinayat_kasasi';
