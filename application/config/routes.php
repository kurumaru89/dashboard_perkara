<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$route['default_controller'] = 'HalamanUtama';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

$route['show_eksekusi'] = 'HalamanUtama/show_eksekusi';
$route['show_eksekusi_ht'] = 'HalamanUtama/show_eksekusi_ht';
$route['get_chart_beban_perkara'] = 'HalamanUtama/get_chart_beban_perkara';
$route['get_pie_beban_perkara'] = 'HalamanUtama/get_pie_beban_perkara';

$route['show_jinayat'] = 'HalamanUtama/show_jinayat';
$route['get_chart_jinayat'] = 'HalamanUtama/get_chart_jinayat';
$route['show_jinayat_kasasi'] = 'HalamanUtama/show_jinayat_kasasi';

$route['get_tabel_faktor_perceraian'] = 'HalamanUtama/get_tabel_faktor_perceraian';
$route['get_tabel_faktor_perceraian_satker'] = 'HalamanUtama/get_tabel_faktor_perceraian_satker';
$route['get_tabel_perkara_terima'] = 'HalamanUtama/get_tabel_perkara_terima';
$route['get_tabel_perkara_terima_satker'] = 'HalamanUtama/get_tabel_perkara_terima_satker';

$route['sakip'] = 'HalamanSakip';
$route['get_pie_perdata_tepat'] = 'HalamanSakip/get_chart_perdata_tepat_waktu';
$route['get_pie_perkara_ecourt'] = 'HalamanSakip/get_chart_perkara_ecourt';
$route['get_pie_jinayat_tepat'] = 'HalamanSakip/get_chart_jinayat_tepat_waktu';