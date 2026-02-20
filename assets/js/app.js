$(function () {
	"use strict";
	// search bar
	$(".mobile-search-icon").on("click", function () {
		$(".search-bar").addClass("full-search-bar");
	});
	$(".search-close").on("click", function () {
		$(".search-bar").removeClass("full-search-bar");
	});
	$(".mobile-toggle-menu").on("click", function () {
		$(".wrapper").addClass("toggled");
	});
	// toggle menu button
	$(".toggle-icon").click(function () {
		if ($(".wrapper").hasClass("toggled")) {
			// unpin sidebar when hovered
			$(".wrapper").removeClass("toggled");
			$(".sidebar-wrapper").unbind("hover");
		} else {
			$(".wrapper").addClass("toggled");
			$(".sidebar-wrapper").hover(function () {
				$(".wrapper").addClass("sidebar-hovered");
			}, function () {
				$(".wrapper").removeClass("sidebar-hovered");
			})
		}
	});
	/* Back To Top */
	$(document).ready(function () {
		$(window).on("scroll", function () {
			if ($(this).scrollTop() > 300) {
				$('.back-to-top').fadeIn();
			} else {
				$('.back-to-top').fadeOut();
			}
		});
		$('.back-to-top').on("click", function () {
			$("html, body").animate({
				scrollTop: 0
			}, 600);
			return false;
		});
	});
	$(function () {
		for (var i = window.location, o = $(".metismenu li a").filter(function () {
			return this.href == i;
		}).addClass("").parent().addClass(""); ;) {
			if (!o.is("li")) break;
			o = o.parent("").addClass("").parent("").addClass("");
		}
	}),
		// metismenu
		$(function () {
			$('#menu').metisMenu();
		});
	// chat toggle
	$(".chat-toggle-btn").on("click", function () {
		$(".chat-wrapper").toggleClass("chat-toggled");
	});
	$(".chat-toggle-btn-mobile").on("click", function () {
		$(".chat-wrapper").removeClass("chat-toggled");
	});
	// email toggle
	$(".email-toggle-btn").on("click", function () {
		$(".email-wrapper").toggleClass("email-toggled");
	});
	$(".email-toggle-btn-mobile").on("click", function () {
		$(".email-wrapper").removeClass("email-toggled");
	});
	// compose mail
	$(".compose-mail-btn").on("click", function () {
		$(".compose-mail-popup").show();
	});
	$(".compose-mail-close").on("click", function () {
		$(".compose-mail-popup").hide();
	});
	/*switcher*/
	$(".switcher-btn").on("click", function () {
		$(".switcher-wrapper").toggleClass("switcher-toggled");
	});
	$(".close-switcher").on("click", function () {
		$(".switcher-wrapper").removeClass("switcher-toggled");
	});
	$("#lightmode").on("click", function () {
		$('html').attr('class', 'light-theme');
	});
	$("#darkmode").on("click", function () {
		$('html').attr('class', 'dark-theme');
	});
	$("#semidark").on("click", function () {
		$('html').attr('class', 'semi-dark');
	});
	$("#minimaltheme").on("click", function () {
		$('html').attr('class', 'minimal-theme');
	});
	$("#headercolor1").on("click", function () {
		$("html").addClass("color-header headercolor1");
		$("html").removeClass("headercolor2 headercolor3 headercolor4 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor2").on("click", function () {
		$("html").addClass("color-header headercolor2");
		$("html").removeClass("headercolor1 headercolor3 headercolor4 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor3").on("click", function () {
		$("html").addClass("color-header headercolor3");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor4").on("click", function () {
		$("html").addClass("color-header headercolor4");
		$("html").removeClass("headercolor1 headercolor2 headercolor3 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor5").on("click", function () {
		$("html").addClass("color-header headercolor5");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor3 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor6").on("click", function () {
		$("html").addClass("color-header headercolor6");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor3 headercolor7 headercolor8");
	});
	$("#headercolor7").on("click", function () {
		$("html").addClass("color-header headercolor7");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor6 headercolor3 headercolor8");
	});
	$("#headercolor8").on("click", function () {
		$("html").addClass("color-header headercolor8");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor6 headercolor7 headercolor3");
	});

	loadChartBebanKerja();
});

function notifikasi(pesan, result) {
	let icon;
	if (result == '1') {
		result = 'success';
		icon = 'bx bx-check-circle';
	} else if (result == '2') {
		result = 'warning';
		icon = 'bx bx-error';
	} else if (result == '3') {
		result = 'error';
		icon = 'bx bx-x-circle';
	} else {
		result = 'info';
		icon = 'bx bx-info-circle';
	}

	Lobibox.notify(result, {
		pauseDelayOnHover: true,
		continueDelayOnInactiveTab: false,
		position: 'top right',
		icon: icon,
		sound: false,
		msg: pesan
	});
}

function getSatker(select) {
	loadDashboardPerkara(select.value);
	loadPiePerkara(select.value);
}

function setFilter() {
	let satker = document.getElementById('satker').value;
	loadDashboardPerkara(satker);
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Tambahkan 1 karena bulan dimulai dari 0
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function loadDashboardPerkara(kode) {
	notifikasi("Menampilkan data satuan kerja", 1);
	let tgl_awal = document.getElementById('tgl_awal').value;
	let tgl_akhir = document.getElementById('tgl_akhir').value;
	loadPiePerkara(kode);

	if (tgl_awal && tgl_akhir) {
		loadTabelEksekusi(kode, tgl_awal, tgl_akhir);
		loadTabelEksekusiHT(kode, tgl_awal, tgl_akhir);
		loadTabelPerkaraJinayat(kode, tgl_awal, tgl_akhir);
	} else {
		loadTabelEksekusi(kode);
		loadTabelEksekusiHT(kode);
		loadTabelPerkaraJinayat(kode);
	}
}

function loadTabelEksekusi(kode, tgl_awal = null, tgl_akhir = null) {

	let postData = { kode: kode };

	// Tambahkan filter kalau ada tanggal
	if (tgl_awal && tgl_akhir) {
		postData.tgl_awal = tgl_awal;
		postData.tgl_akhir = tgl_akhir;
	}

	$.post('show_eksekusi', postData, function (response) {
		try {
			const json = JSON.parse(response);
			$('#tabelEksekusi').html('');

			if (!json.data_eksekusi || json.data_eksekusi.length === 0) {
				$('#tabelEksekusi').html(`
					<div class="row">
						<div class="col">
							<div class="alert border-0 border-start border-5 border-info py-2">
								<div class="d-flex align-items-center">
									<div class="font-35 text-info">
										<i class='bx bx-info-square'></i>
									</div>
									<div class="ms-3">
										<h6 class="mb-0 text-info">Informasi</h6>
										<div>Belum Ada Perkara Eksekusi, atau belum ada sinkronisasi ke satker daerah.</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				`);
				return;
			}

			let data = `
				<div class="table-responsive">
				<table id="tabelEksekusiData" class="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th>Nama Satker</th>
							<th>Nomor Perkara Perdata</th>
							<th>Nomor Perkara Eksekusi</th>
							<th>Permohonan Eksekusi</th>
							<th>Penetapan Teguran Eksekusi</th>
							<th>Pelaksanaan Teguran Eksekusi</th>
							<th>Penetapan Sita Eksekusi</th>
							<th>Pelaksanaan Sita Eksekusi</th>
						</tr>
					</thead>
					<tbody>
			`;

			json.data_eksekusi.forEach((row) => {
				data += `
					<tr>
						<td>${row.nama_satker}</td>
						<td>${row.nomor_perkara_pn}</td>
						<td>${row.nomor_register_eksekusi}</td>
						<td>${row.permohonan_eksekusi}</td>
						<td>${row.penetapan_teguran_eksekusi}</td>
						<td>${row.pelaksanaan_teguran_eksekusi}</td>
						<td>${row.penetapan_sita_eksekusi}</td>
						<td>${row.pelaksanaan_sita_eksekusi}</td>
					</tr>
				`;
			});

			data += `
					</tbody>
				</table>
				</div>
			`;

			$('#tabelEksekusi').append(data);

			$("#tabelEksekusiData").DataTable({
				order: [[3, 'desc']],
				dom: 'Bfrtip',
				buttons: [
					{
						extend: 'excelHtml5',
						text: 'Excel',
						title: 'Data Eksekusi Perkara',
						className: 'btn btn-outline-info px-5 mb-2',
						exportOptions: {
							columns: ':visible'
						}
					}
				]
			});

		} catch (e) {
			console.error("Gagal parsing JSON:", e);
			$('#tabelEksekusi').html('<div class="alert alert-danger">Gagal memuat data eksekusi.</div>');
		}
	});
}

function loadTabelEksekusiHT(kode, tgl_awal = null, tgl_akhir = null) {
	let postData = { kode: kode };

	// Tambahkan filter kalau ada tanggal
	if (tgl_awal && tgl_akhir) {
		postData.tgl_awal = tgl_awal;
		postData.tgl_akhir = tgl_akhir;
	}

	$.post('show_eksekusi_ht', { kode: kode }, function (response) {
		try {
			const json = JSON.parse(response); // Pastikan server kirim JSON valid

			$('#tabelEksekusiHT').html(''); // kosongkan wrapper

			if (!json.data_eksekusi_ht || json.data_eksekusi_ht.length === 0) {
				// Kalau kosong
				$('#tabelEksekusiHT').html(`
                    <div class="row">
                        <div class="col">
                            <div class="alert border-0 border-start border-5 border-info alert-dismissible fade show py-2">
                                <div class="d-flex align-items-center">
                                    <div class="font-35 text-info"><i class='bx bx-info-square'></i></div>
                                    <div class="ms-3">
                                        <h6 class="mb-0 text-info">Informasi</h6>
                                        <div>Belum Ada Perkara Eksekusi, atau belum ada sinkronisasi ke satker daerah.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
				return;
			}

			// Kalau ada data, buat tabelnya
			let data = `
				<div class="table-responsive">
				<table id="tabelEksekusiHTData" class="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th>Nama Satker</th>
							<th>Nomor Perkara Eksekusi</th>
							<th>Permohonan Eksekusi</th>
							<th>Penetapan Teguran Eksekusi</th>
							<th>Pelaksanaan Teguran Eksekusi</th>
							<th>Penetapan Sita Eksekusi</th>
							<th>Pelaksanaan Sita Eksekusi</th>
						</tr>
					</thead>
					<tbody>
			`;

			json.data_eksekusi_ht.forEach((row, index) => {
				// Daftar Barang
				data += `
                    <tr>
                        <td>${row.nama_satker}</td>
                        <td>${row.nomor_register_eksekusi}</td>
                        <td>${row.permohonan_eksekusi}</td>
                        <td>${row.penetapan_teguran_eksekusi}</td>
                        <td>${row.pelaksanaan_teguran_eksekusi}</td>
                        <td>${row.penetapan_sita_eksekusi}</td>
                        <td>${row.pelaksanaan_sita_eksekusi}</td>
                    </tr>
                `;
			});

			data += `
				</tbody>
                </table>
                </div>
			`

			$('#tabelEksekusiHT').append(data);

			// Aktifkan DataTables
			$("#tabelEksekusiHTData").DataTable({
				order: [[2, 'desc']],
				dom: 'Bfrtip',
				buttons: [
					{
						extend: 'excelHtml5',
						text: 'Excel',
						title: 'Data Eksekusi Perkara Hak Tanggungan',
						className: 'btn btn-outline-info px-5 mb-2',
						exportOptions: {
							columns: ':visible'
						}
					}
				]
			});

		} catch (e) {
			console.error("Gagal parsing JSON:", e);
			$('#tabelEksekusiHT').html('<div class="alert alert-danger">Gagal memuat data eksekusi.</div>');
		}
	});
}

function loadChartBebanKerja() {

	$.ajax({
		url: 'get_chart_beban_perkara',
		type: 'GET',
		dataType: 'json',
		success: function (response) {

			var options = {
				series: [{
					name: 'Perkara Masuk Tahun Ini',
					data: response.perkara_masuk
				}, {
					name: 'Sisa Perkara Tahun Lalu',
					data: response.sisa_perkara
				}],
				chart: {
					foreColor: '#9ba7b2',
					type: 'bar',
					height: 360
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '55%',
						endingShape: 'rounded'
					},
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					show: true,
					width: 2,
					colors: ['transparent']
				},
				title: {
					text: 'Grafik Beban Kerja Per Satker',
					align: 'left',
					style: {
						fontSize: '14px'
					}
				},
				colors: ['#0d6efd', '#ffc107'],
				xaxis: {
					categories: response.categories
				},
				yaxis: {
					title: {
						text: 'Jumlah Perkara'
					}
				},
				fill: {
					opacity: 1
				},
				tooltip: {
					y: {
						formatter: function (val) {
							return val + " Perkara"
						}
					}
				}
			};

			var chart = new ApexCharts(
				document.querySelector("#grafikBebanKerja"),
				options
			);

			chart.render();
		}
	});
}

var pieChart = null;
function loadPiePerkara(kode_satker) {

	$.ajax({
		url: 'get_pie_beban_perkara',
		type: "GET",
		data: { kode_satker: kode_satker },
		dataType: "json",
		beforeSend: function () {
			$("#chartBebanKerja").html("<div class='text-center p-5'>Loading chart...</div>");
		},
		success: function (res) {

			$("#chartBebanKerja").html("");

			// destroy chart lama (WAJIB supaya tidak numpuk)
			if (pieChart !== null) {
				pieChart.destroy();
			}

			var options = {
				series: [res.masuk, res.sisa],
				chart: {
					foreColor: '#9ba7b2',
					height: 330,
					type: 'donut',
				},
				colors: ["#0d6efd", "#f41127"],
				labels: ['Perkara Masuk Tahun Ini', 'Sisa Perkara Tahun Lalu'],
				legend: { position: 'bottom' },
				dataLabels: {
					formatter: function (val, opts) {
						return opts.w.config.series[opts.seriesIndex] + " perkara";
					}
				},
				tooltip: {
					y: {
						formatter: function (val) {
							return val + " perkara";
						}
					}
				}
			};

			pieChart = new ApexCharts(document.querySelector("#chartBebanKerja"), options);
			pieChart.render();
		}
	});
}

function loadTabelPerkaraJinayat(kode, tgl_awal = null, tgl_akhir = null) {

	let postData = { kode: kode };

	// Tambahkan filter kalau ada tanggal
	if (tgl_awal && tgl_akhir) {
		postData.tgl_awal = tgl_awal;
		postData.tgl_akhir = tgl_akhir;
	}

	$.post('show_jinayat', postData, function (response) {
		try {
			const json = JSON.parse(response);
			$('#tabelPerkaraJinayat').html('');

			console.log(json.data_jinayat);

			if (!json.data_jinayat || json.data_jinayat.length === 0) {
				$('#tabelPerkaraJinayat').html(`
					<div class="row">
						<div class="col">
							<div class="alert border-0 border-start border-5 border-info py-2">
								<div class="d-flex align-items-center">
									<div class="font-35 text-info">
										<i class='bx bx-info-square'></i>
									</div>
									<div class="ms-3">
										<h6 class="mb-0 text-info">Informasi</h6>
										<div>Belum Ada Perkara Jinayat, atau belum ada sinkronisasi ke satker daerah.</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				`);
				return;
			}

			let data = `
				<div class="table-responsive">
				<table id="tabelPerkaraJinayatData" class="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th>Nama Satker</th>
							<th>Nomor Perkara</th>
							<th>Jenis Jarimah</th>
							<th>Tanggal Masuk Perkara</th>
							<th>Tanggal Putus Perkara</th>
							<th>Jenis Hukuman</th>
							<th>Nama Terdakwa</th>
							<th>Usia Terdakwa</th>
						</tr>
					</thead>
					<tbody>
			`;

			json.data_jinayat.forEach((row) => {
				data += `
					<tr>
						<td>${row.nama_satker}</td>
						<td>${row.nomor_perkara}</td>
						<td>${row.jenis_perkara}</td>
						<td>${row.tanggal_pendaftaran}</td>
						<td>${row.tanggal_putusan}</td>
						<td>${row.jenis_hukuman}</td>
						<td>${row.nama_terdakwa}</td>
						<td>${row.usia} Tahun</td>
					</tr>
				`;
			});

			data += `
					</tbody>
				</table>
				</div>
			`;

			$('#tabelPerkaraJinayat').append(data);

			$("#tabelPerkaraJinayatData").DataTable({
				order: [[3, 'desc']],
				dom: 'Bfrtip',
				buttons: [
					{
						extend: 'excelHtml5',
						text: 'Excel',
						title: 'Data Eksekusi Perkara',
						className: 'btn btn-outline-info px-5 mb-2',
						exportOptions: {
							columns: ':visible'
						}
					}
				]
			});

		} catch (e) {
			console.error("Gagal parsing JSON:", e);
			$('#tabelEktabelPerkaraJinayatsekusi').html('<div class="alert alert-danger">Gagal memuat data perkara jinayat.</div>');
		}
	});
}
